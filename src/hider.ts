import { Logger, ILogObj } from "tslog";

import * as browser from "webextension-polyfill";

import {
	Hidee,
	HideeStyle,
	HiderOptions,
	UniversalStyles,
	ExtendedStyles,
} from "./types";

export class Hider {
	private options: HiderOptions;
	private domain: string;
	private onShowOnce: (hidee: Hidee, domain: string) => void;
	private extension: string;
	// Store hiddenNodes by hash
	// Info: you can get hash from class, and slug from hash (in hiddenNodes)
	private hiddenNodes: Record<string, any> = {};
	// Track current URL
	private currentUrl: string | null = null;
	private isDocumentHeadLoaded = false;
	private domainHidees: Hidee[];
	private observer: MutationObserver;
	private log: Logger<ILogObj> = new Logger();

	// Define universal styles always applied to hidee nodes
	private universalStyles: UniversalStyles = {
		pointerEvents: "none",
		cursor: "default",
		display: "flex",
		flexDirection: "column",
		border: "none",
		boxShadow: "none",
	};

	constructor(
		options: HiderOptions,
		domain: string,
		onShowOnce: (hidee: Hidee, domain: string) => void,
		extension: string,
	) {
		// Need the domain hidees to do anything
		this.options = options;
		this.domain = domain;
		this.domainHidees = this.options.hidees
			// Figure out if we should hide the hidee at all
			.filter(
				(hidee) =>
					!this.options.excludedHidees.includes(hidee.slug) &&
					hidee.domain.includes(this.domain),
			)
			// And if so, if we should show a menu
			.map((hidee) => {
				if (this.options.noMenuHidees.includes(hidee.slug)) {
					hidee.noMenu = true;
				}
				return hidee;
			});
		// this.log.trace("Domain hidees", this.domainHidees);

		this.observer = new MutationObserver(() => {
			this.onMutation();
		});

		const onInterval = setInterval(() => {
			this.onInterval();
		}, 50);

		// Get things started straight away
		this.onShowOnce = onShowOnce;
		this.extension = extension;

		this.init();
	}

	// Observe the document if you have a valid domain and domainHidees is longer than zero
	private init(): void {
		this.log.info(
			this.domainHidees.map((hidee) => {
				return `${hidee.section}: ${hidee.cssSelector}`;
			}),
		);
		// Observe the document if you have a valid domain and domainHidees is longer than zero
		if (this.domainHidees.length > 0) {
			// Observe the doc
			this.observer.observe(document, {
				childList: true,
				subtree: true,
				characterData: false,
			});
		}
	}

	private processHidee(hidee: Hidee): void {
		if (this.isDocumentHeadLoaded) {
			if (hidee.isOnExcludedPage) {
				this.log.info("Show: excluded page");
				this.showHidee(hidee);
				return;
			}
			if (hidee.isShownByUser) {
				this.log.info("Show: by user");
				this.showHidee(hidee);
				return;
			}
			this.hideHidee(hidee);
		}
	}

	// This is the wrapper for processing every hidee for a match with the page
	// Probably useful to keep this logic
	private onMutation = (): void => {
		let runProcessHidee = false;

		// Two things can cause us to runProcessHidee
		// 1. A page change
		const newUrl = window.location.href;
		const isUrlChanged = newUrl !== this.currentUrl || this.currentUrl === null;
		this.currentUrl = newUrl;
		this.domainHidees.forEach((hidee) => {
			if (isUrlChanged) {
				this.log.info(
					this.currentUrl,
					`Exclude: ${hidee.excludedPages}, exact: ${hidee.exactPages}, include: ${hidee.includedPages}`,
				);
				hidee.isOnExcludedPage = this.isHideeIgnoredByUrl(
					this.currentUrl,
					hidee,
				);
				runProcessHidee = true;
			}
		});

		// 2. The initial page load
		if (document.head && !this.isDocumentHeadLoaded) {
			this.addCSS(`${this.extension}-hider-menu`, this.options.menuCss);
			this.isDocumentHeadLoaded = true;
			// This should only run once, hence including it in here
			runProcessHidee = true;
		}

		// If either of those is true, let's run it!
		if (runProcessHidee) {
			this.domainHidees.map((hidee) => {
				this.processHidee(hidee);
			});
		}
	};

	// Every 10ms
	private onInterval = (): void => {
		// Wait until document loaded
		if (this.isDocumentHeadLoaded) {
			this.domainHidees.map((hidee) => {
				if (hidee.cssSelector) {
					this.processHidee(hidee);
				}
			});
		}
	};

	// Once we have an element, hide it and add circle
	private hideHidee(hidee: Hidee, onLoad?: boolean): void {
		this.log.info(`Hide hidee: ${hidee.slug}`);
		// 1. Does the hidee already have a hash?
		if (!hidee.hash) {
			hidee.hash = this.getOrCreateAndSetNodeHash(hidee) as string;
		}

		// 2. Do we have a cssSelector, and if so, do we have a style element?
		// Add a new style tag to hide the element itself
		// Add the style tag to hide the element's children (or could do this later)
		// Probably want to mark these both with a hash
		if (hidee.cssSelector) {
			this.checkOrAddStyleElement(hidee);

			// 3. If not our first time, let's look for a node to hide?

			if (this.isDocumentHeadLoaded) {
				try {
					const nodeList = document.querySelectorAll(hidee.cssSelector);
					if (nodeList.length > 1) {
						this.log.warn(
							`Looks like '${hidee.section}: ${hidee.cssSelector}' finds ${nodeList.length} nodes`,
						);
					}
					const node = nodeList[0];

					if (node) {
						// 4. If a node exists, let's add a nice hash to its hidee attribute?
						if (!node.hasAttribute("hidee")) {
							this.setNodeHash(node, hidee.hash);
						}

						// Let's directly alter the styles on the node
						this.applyHiddenStyles(node, hidee, hidee.hash);

						// And add the menu
						if (!hidee.noMenu) {
							this.handleMenu(node, hidee, hidee.hash);
						}
					}
				} catch (e) {
					this.log.error(e);
				}
			}
		}
	}

	private showHidee(hidee: Hidee): void {
		// 1. Replace the styles on the element

		this.log.info(`Show hidee: ${hidee.slug}`);

		if (hidee.cssSelector) {
			// 1. Find the node
			const nodeList = document.querySelectorAll(hidee.cssSelector);
			const node = nodeList[0];

			// If there is a node
			if (node) {
				// 2.a. Remove current styles
				if (node.hasAttribute("style")) {
					node.removeAttribute("style");
				}

				// 2.b. Replace styles
				if (hidee.previousStyles) {
					Object.entries(hidee.previousStyles).forEach(([property, value]) => {
						if (property !== "slug") {
							(node as HTMLElement).style[property as any] = value as string;
						}
					});
				}

				// 3. Delete menu
				const menu = node.querySelector(`.${this.options.menuClass}`);
				if (menu) menu.remove();
			}
		}

		// 4. Delete style
		const styleElement = document.getElementById(`hidee-style-${hidee.hash}`);

		if (styleElement) styleElement.remove();

		// 5. Delete hidee.hash
		delete hidee.hash;
	}

	private handleMenu(node: Element, hidee: Hidee, hash: string): void {
		const existingMenu = node.querySelector(`.${this.options.menuClass}`);

		if (existingMenu) {
			this.log.info(`${hidee.slug}: Existing menu`);
			// This is a manual override to make sure the text of the button is correct
			// No idea why it's needed. We can check it out historically
			if (hidee.checkMenu) {
				const correctHtml = this.updateButtonHtml(hidee);
				if (existingMenu.outerHTML !== correctHtml) {
					existingMenu.remove();
				}
			}

			if (hidee.checkMenuPosition) {
				const isCorrectPosition =
					hidee.style.flexDirection !== "column-reverse"
						? existingMenu === node.firstElementChild
						: existingMenu === node.lastElementChild;

				if (!isCorrectPosition) {
					existingMenu.remove();
				}
			}
		} else if (!hidee.noMenu && !this.options.hider_invisibility) {
			this.log.info(`${hidee.slug}: No existing menu`);
			this.addMenu(node, hidee, hash);
		}
	}

	private addMenu(node: Element, hidee: Hidee, hash: string): void {
		try {
			// On Facebook, adding the button doesn't go down well
			// It causes mayhem! Some kind of race condition
			// So we have a hack to get around that, where we add the button at the very end of the element
			// And we apply flex column-reverse so it shows at the start
			const position =
				hidee.style.flexDirection === "column-reverse"
					? "beforeend"
					: "afterbegin";
			const menuHtml = this.updateButtonHtml(hidee);
			node.insertAdjacentHTML(position, menuHtml);
			this.setupButtonListenersAndStyles(node, hidee);
		} catch (e) {
			console.error("Error adding menu:", e);
		}
	}

	private setupButtonListenersAndStyles(node: Element, hidee: Hidee): void {
		const menu = node.querySelector(`.${this.options.menuClass}`);
		if (!menu) return;

		const button = menu.querySelector(
			`#hider-button-${hidee.hash}`,
		) as HTMLElement;

		button.onclick = () => {
			this.log.info("Show: on click");
			this.showHidee(hidee);
			hidee.isShownByUser = true;
			this.onShowOnce(hidee, this.domain);
		};
	}

	private applyHiddenStyles(node: Element, hidee: Hidee, hash: string): void {
		// The setIntervalMethod is used exclusively for YouTube. Not sure what that means!

		const applyStyles = this.getApplyStyles(hidee.style);
		let previousStyles: Record<string, string> = {};

		Object.entries(applyStyles).forEach(([style, value]) => {
			if ((node as HTMLElement).style[style as any] !== value) {
				previousStyles[style] = (node as HTMLElement).style[style as any];
				(node as HTMLElement).style[style as any] = `${value}`;
			}
		});

		// Store previous styles to hiddenNodes
		hidee.previousStyles = { ...previousStyles };
	}

	private getApplyStyles(styleObj: HideeStyle): ExtendedStyles {
		let styles: ExtendedStyles = { ...this.universalStyles };

		if (this.options.hider_invisibility) {
			styles.display = "none";
		}

		if (styleObj.maxHeight) {
			styles = {
				...styles,
				maxHeight: styleObj.maxHeight,
				overflow: "hidden",
				paddingTop: "0px",
			};
		}

		if (styleObj.minHeight) {
			styles.minHeight = styleObj.minHeight;
		}

		if (styleObj.flexDirection) {
			styles.flexDirection = styleObj.flexDirection;
			styles.justifyContent = "flex-end";
		}

		if (styleObj.backgroundColor) {
			styles = {
				...styles,
				backgroundColor: styleObj.backgroundColor,
				// Deleted this, boxShadow now applied universally
				// boxShadow: "none",
				borderStyle: "none",
				borderRadius: "4px",
			};
		}

		if (styleObj.borderRadius) {
			styles.borderRadius = styleObj.borderRadius;
		}

		if (styleObj.marginBottom) {
			styles.marginBottom = styleObj.marginBottom;
		}

		return styles;
	}

	private checkOrAddStyleElement(hidee: Hidee): void {
		const { hash, cssSelector } = hidee;
		const existingStyle = document.getElementById(`hidee-style-${hash}`);
		if (!existingStyle) {
			this.updateStyleElementInnerHtml(hidee);
		} else {
			this.checkStyleElementInnerHtml(existingStyle, hidee);
		}
	}

	private updateStyleElementInnerHtml(hidee: Hidee): void {
		const styleId = `hidee-style-${hidee.hash}`;
		const styleInnerHtml = this.createChildHiddenStyleInnerHtml(hidee);
		this.updateInnerHtml(styleInnerHtml, styleId);
	}

	// Not sure why this is necessary
	private checkStyleElementInnerHtml(
		existingStyle: HTMLElement,
		hidee: Hidee,
	): void {
		const correctInnerHtml = this.createChildHiddenStyleInnerHtml(hidee);
		if (existingStyle.innerHTML !== correctInnerHtml) {
			existingStyle.innerHTML = correctInnerHtml;
		}
	}

	private createChildHiddenStyleInnerHtml(hidee: Hidee): string {
		const { cssSelector } = hidee;
		let { backgroundColor = "white", color = "black" } = hidee.buttonStyle;
		const childSelector = `${cssSelector} > :not(.${this.options.menuClass}) *, ${cssSelector} > :not(.${this.options.menuClass})`;

		// We have a special part of this

		return `
        :root {
            --hider-menu-bg: ${backgroundColor};
        }
        ${cssSelector} { 
            pointer-events: none !important; 
            background: none !important; 
            border: 0 !important; 
            box-shadow: none !important;
			${
				hidee.style.flexDirection === "column-reverse" &&
				`
				display: flex !important;
				flex-direction: column-reverse !important; 
				`
			}
        }
        ${childSelector} { 
            opacity: 0 !important; 
            box-shadow: none !important; 
            border: none !important; 
        } 
        ${cssSelector}:after { 
            display: none; 
        } 
        ${cssSelector}:before { 
            display: none; 
        } 
        ${cssSelector} > .${this.options.menuClass} > .hider-menu:hover { 
            color: ${color} !important; 
        }
    `;
	}

	private isHideeIgnoredByUrl(
		currentUrl: string | null,
		hidee: Hidee,
	): boolean {
		const { excludedPages, exactPages, includedPages } = hidee;

		// This is quite janky, not clear if it allows multiple options
		if (excludedPages && currentUrl?.includes(excludedPages)) {
			this.log.info("Ignore: excluded");
			return true;
		}
		if (exactPages && currentUrl !== `${exactPages}`) {
			this.log.info("Ignore: not exact");
			return true;
		}
		if (includedPages && currentUrl && !currentUrl.includes(includedPages)) {
			this.log.info("Ignore: not included");
			return true;
		}
		return false;
	}

	private getOrCreateAndSetNodeHash(hidee: Hidee, node?: Element) {
		let hash: string;
		if (!node) {
			hash = this.getUid();
			hidee.hash = hash;
			// FIXME: previously had something here about hiddenNodes too
		} else {
			hash =
				node.getAttribute("hidee") ||
				Object.entries(this.hiddenNodes).find(
					([, value]) => value.slug === hidee.slug,
				)?.[0] ||
				// This is a fallback that should never happen
				this.getUid();
		}
		return hash;
	}

	private setNodeHash(node: Element, hash: string): void {
		node.setAttribute("hidee", hash);
	}

	private getUid(): string {
		const randomPool = new Uint8Array(32);
		crypto.getRandomValues(randomPool);
		const hex = Array.from(randomPool, (b) =>
			b.toString(16).padStart(2, "0"),
		).join("");
		return `hider-${hex.substring(0, 58)}`;
	}

	private updateButtonHtml(hidee: Hidee): string {
		return this.options.menuHtmlString
			.replace("Show Section", `Show ${hidee.shortName}`)
			.replace("hider-button", `hider-button-${hidee.hash}`);
	}

	private updateInnerHtml(styleInnerHtml: string, styleId: string): void {
		let style = document.createElement("style");
		style.innerHTML = styleInnerHtml;
		style.id = styleId;
		document.head.appendChild(style);
	}

	// Check if this is working
	private addCSS(cssId: string, url: string): void {
		if (!document.getElementById(cssId)) {
			const link = document.createElement("link");
			link.id = cssId;
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = browser.runtime.getURL(url);
			link.media = "all";
			document.head.appendChild(link);
		}
	}
}
