import { debounce } from "lodash";

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
	private onShowAlways: (hidee: Hidee, domain: string) => void;
	private extension: string;
	// Store hiddenNodes by hash
	// Info: you can get hash from class, and slug from hash (in hiddenNodes)
	private hiddenNodes: Record<string, any> = {};
	// Track current URL
	private currentUrl: string | null = null;
	private domainHidees: Hidee[];
	private observer: MutationObserver;

	// Define universal styles always applied to hidee nodes
	private universalStyles: UniversalStyles = {
		pointerEvents: "none",
		cursor: "default",
		display: "flex",
		flexDirection: "column",
	};

	constructor(
		options: HiderOptions,
		domain: string,
		onShowOnce: (hidee: Hidee, domain: string) => void,
		onShowAlways: (hidee: Hidee, domain: string) => void,
		extension: string,
	) {
		// Need the domain hidees to do anything
		this.options = options;
		this.domain = domain;
		this.domainHidees = this.options.hidees.filter(
			(hidee) =>
				!this.options.excludedHidees.includes(hidee.slug) &&
				hidee.domain.includes(this.domain),
		);

		this.observer = new MutationObserver(() => {
			this.processHidees();
		});
		// Get things started straight away
		this.onShowOnce = onShowOnce;
		this.onShowAlways = onShowAlways;
		this.extension = extension;

		this.init();
	}

	// Observe the document if you have a valid domain and domainHidees is longer than zero
	private init(): void {
		// Observe the document if you have a valid domain and domainHidees is longer than zero
		if (this.domainHidees.length > 0) {
			console.log("yes");
			// Special case for YouTube
			if (this.domain === "youtube.com") {
				this.observeYouTubeAtIntervals();
			} else {
				// Observe the doc
				this.observer.observe(document, {
					childList: true,
					subtree: true,
					characterData: false,
				});
			}
		}
		// FIXME: trying to add the styles the second the document head exists
		// Used to do this with a DOMSubtreeModified event and a check for existence of
		// document.head, but that was going to be deprecated. So now doing this
		// There may be a more efficient way using the mutation observer to be honest
		const checkHeadExistence = setInterval(() => {
			if (document.head) {
				clearInterval(checkHeadExistence);
				this.addCSS(`${this.extension}-hider-menu`, this.options.menuCss);
				if (this.domain === "youtube.com") {
					this.addYouTubeStyles();
				}
			}
		}, 50);
	}

	private addYouTubeStyles(): void {
		this.domainHidees.forEach((hidee) => {
			const hash = this.getUid();
			this.addSelfStyles(hidee, hash);
			// Need to apply child hidden styles too!
			this.checkAndAddChildHiddenStyles(hash, hidee.id, hidee.className);
			// Set hash
			hidee.hash = hash;
		});
	}

	private observeYouTubeAtIntervals(): void {
		setInterval(() => {
			if (!document.getElementById("hider-menu")) {
				this.processHidees();
			} else {
				console.log("Activated this");
			}
		}, 1000);
	}

	// This is the wrapper for processing every hidee for a match with the page
	private processHidees = (): void => {
		const newUrl = window.location.href;
		const urlChanged = newUrl !== this.currentUrl || this.currentUrl === null;
		this.currentUrl = newUrl;

		this.domainHidees.forEach((hidee) => {
			if (urlChanged) {
				hidee.ignored = this.isHideeIgnoredByUrl(
					this.currentUrl,
					hidee.ignorePages,
					hidee.includePages,
				);
			}
			this.findHideeNodesInDoc(hidee).forEach((node) =>
				this.processNode(node, hidee),
			);
		});
	};

	private processNode(node: Element, hidee: Hidee): void {
		if (hidee.excluded || hidee.ignored) {
			this.showNode(node, this.getOrCreateNodeHash(node, hidee));
			return;
		}
		this.hideNode(node, hidee, this.getOrCreateNodeHash(node, hidee));
	}

	// Once we have an element, hide it and add circle
	private hideNode(node: Element, hidee: Hidee, hash: string): void {
		// 1. Does the hash exist in hiddenNodes?
		if (!this.hiddenNodes[hash]) {
			this.hiddenNodes[hash] = { slug: hidee.slug };
		}

		// 2. Does the hidee attribute exist?
		// You can get hash from class, and slug from hash (in hiddenNodes)
		// Note: this is just a safety check
		// The real job of checking for a hash and getting a hash is done in a separate function within processNode
		if (!node.hasAttribute("hidee")) {
			this.setNodeHash(node, hash);
		}

		// For special cases where we need hidees to have different ids because they are only identified by class, we apply id
		if (hidee.applyId && (!node.id || node.id.length === 0)) {
			node.id = hash;
		}

		// 4. Does the node have a child element that's the hide-menu-container?
		// Look for menu
		this.applyHiddenStyles(node, hash, hidee);
		this.checkAndAddChildHiddenStyles(hash, node.id, node.className);
		this.handleMenu(node, hidee, hash);
	}

	private showNode(node: Element, hash: string): void {
		if (this.hiddenNodes[hash]) {
			Object.entries(this.hiddenNodes[hash]).forEach(([property, value]) => {
				if (property !== "slug") {
					(node as HTMLElement).style[property as any] = value as string;
				}
			});
		}

		const menu = node.querySelector(`.${this.options.menuClass}`);
		if (menu) menu.remove();

		const childHiddenStyle = document.getElementById(`hidee-children-${hash}`);
		if (childHiddenStyle) childHiddenStyle.remove();

		const selfHiddenStyle = document.getElementById(`hidee-self-${hash}`);
		if (selfHiddenStyle) selfHiddenStyle.remove();
	}

	private handleMenu(node: Element, hidee: Hidee, hash: string): void {
		const existingMenu = node.querySelector(`.${this.options.menuClass}`);

		if (existingMenu) {
			if (hidee.checkMenu) {
				const correctHtml = this.correctMenuHtml(hidee.shortName);
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
			this.addMenu(node, hidee, hash);
		}
	}

	private addMenu(node: Element, hidee: Hidee, hash: string): void {
		try {
			const position =
				hidee.style.flexDirection === "column-reverse"
					? "beforeend"
					: "afterbegin";
			const menuHtml = this.correctMenuHtml(hidee.shortName);
			node.insertAdjacentHTML(position, menuHtml);
			this.setupMenuListeners(node, hidee, hash);
		} catch (e) {
			console.error("Error adding menu:", e);
		}
	}

	private setupMenuListeners(node: Element, hidee: Hidee, hash: string): void {
		const menu = node.querySelector(`.${this.options.menuClass}`);
		if (!menu) return;

		const dropdown = menu.querySelector("div > div > div") as HTMLElement;
		const supportButtonContainer = menu.children[1] as HTMLElement;

		if (supportButtonContainer) {
			(supportButtonContainer.children[0] as HTMLAnchorElement).href =
				this.options.supportLink;
		}

		const showOnceLink = dropdown.querySelector(
			"#hider-show-once",
		) as HTMLElement;
		const showAlwaysLink = dropdown.querySelector(
			"#hider-show-always",
		) as HTMLElement;

		showOnceLink.onclick = () => {
			this.showNode(node, hash);
			hidee.excluded = true;
			this.onShowOnce(hidee, this.domain);
		};

		showAlwaysLink.onclick = () => {
			this.showNode(node, hash);
			hidee.excluded = true;
			this.onShowAlways(hidee, this.domain);
		};
	}

	private applyHiddenStyles(node: Element, hash: string, hidee: Hidee): void {
		if (!hidee.setIntervalMethod) {
			const applyStyles = this.getApplyStyles(hidee.style);
			let prevStyle: Record<string, string> = {};

			Object.entries(applyStyles).forEach(([style, value]) => {
				if ((node as HTMLElement).style[style as any] !== value) {
					prevStyle[style] = (node as HTMLElement).style[style as any];
					(node as HTMLElement).style.setProperty(style, value, "important");
				}
			});

			this.hiddenNodes[hash] = { ...prevStyle, ...this.hiddenNodes[hash] };
		} else {
			if (!document.getElementById(`hidee-self-${hash}`)) {
				this.addSelfStyles(hidee, hash);
			}
		}
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
				boxShadow: "none",
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

	private addSelfStyles(hidee: Hidee, hash: string): void {
		const applyStyles = this.getApplyStyles(hidee.style);
		const styleInnerHtml = `${this.selector(hidee.id, hidee.className)} {${this.formatApplyStylesForStyle(applyStyles)}}`;
		this.styleAdder(styleInnerHtml, `hidee-self-${hash}`);
	}

	private checkAndAddChildHiddenStyles(
		hash: string,
		id: string | undefined,
		className: string | undefined,
	): void {
		const existingStyle = document.getElementById(`hidee-children-${hash}`);
		if (!existingStyle) {
			this.addChildHiddenStyles(hash, id, className);
		} else {
			this.checkChildHiddenStyles(existingStyle, id, className);
		}
	}

	private addChildHiddenStyles(
		hash: string,
		id: string | undefined,
		className: string | undefined,
	): void {
		const styleId = `hidee-children-${hash}`;
		const styleInnerHtml = this.createChildHiddenStyleInnerHtml(id, className);
		this.styleAdder(styleInnerHtml, styleId);
	}

	private checkChildHiddenStyles(
		existingStyle: HTMLElement,
		id: string | undefined,
		className: string | undefined,
	): void {
		const correctInnerHtml = this.createChildHiddenStyleInnerHtml(
			id,
			className,
		);
		if (existingStyle.innerHTML !== correctInnerHtml) {
			existingStyle.innerHTML = correctInnerHtml;
		}
	}

	private createChildHiddenStyleInnerHtml(
		id: string | undefined,
		className: string | undefined,
	): string {
		const selector = this.selector(id, className);
		const childSelector = `${selector} > :not(.${this.options.menuClass}) *, ${selector} > :not(.${this.options.menuClass})`;
		return `${childSelector} { opacity: 0 !important; } ${selector}:after { display: none; } ${selector}:before { display: none; }`;
	}

	private selector(
		id: string | undefined,
		className: string | undefined,
	): string {
		let result = "";
		if (className) {
			result += `.${className.trim().replace(/\s+/g, ".")}`;
		}
		if (id) {
			result += `#${id}`;
		}
		return result;
	}

	private isHideeIgnoredByUrl(
		currentUrl: string | null,
		ignorePages?: string,
		includePages?: string,
	): boolean {
		if (ignorePages && currentUrl?.includes(ignorePages)) {
			return true;
		}
		if (includePages && !currentUrl?.includes(includePages)) {
			return true;
		}
		return false;
	}

	private findHideeNodesInDoc(hidee: Hidee): Element[] {
		let nodes: Element[] = [];

		if (hidee.id && hidee.className) {
			nodes = Array.from(
				document.getElementsByClassName(hidee.className),
			).filter((node) => node.id === hidee.id);
		} else if (hidee.id) {
			const node = document.getElementById(hidee.id);
			if (node) nodes = [node];
		} else if (hidee.className) {
			nodes = Array.from(document.getElementsByClassName(hidee.className));
		}

		return nodes.filter((node) => this.nodeMatchesHideeConditions(node, hidee));
	}

	private nodeMatchesHideeConditions(node: Element, hidee: Hidee): boolean {
		if (
			hidee.parentClassName &&
			node.parentElement?.className !== hidee.parentClassName
		) {
			return false;
		}

		if (
			hidee.parentParentClassName &&
			node.parentElement?.parentElement?.className !==
				hidee.parentParentClassName
		) {
			return false;
		}

		if (hidee.customAttributeName && hidee.customAttributeValue) {
			const attr = node.getAttribute(hidee.customAttributeName);
			if (!attr || attr !== hidee.customAttributeValue) {
				return false;
			}
		}

		if (hidee.tagName && node.tagName !== hidee.tagName) {
			return false;
		}

		if (hidee.classNameExactMatch && node.className !== hidee.className) {
			return false;
		}

		if (hidee.innerText && node.innerHTML.trim() !== hidee.innerText) {
			return false;
		}

		if (hidee.firstChildId || hidee.firstChildClassName) {
			let firstChild = node.children[0];
			if (firstChild?.className === this.options.menuClass) {
				firstChild = node.children[1];
			}

			if (!firstChild) return false;

			if (hidee.firstChildId && hidee.firstChildClassName) {
				if (
					firstChild.id !== hidee.firstChildId ||
					firstChild.className !== hidee.firstChildClassName
				) {
					return false;
				}
			} else if (hidee.firstChildId && firstChild.id !== hidee.firstChildId) {
				return false;
			} else if (
				hidee.firstChildClassName &&
				firstChild.className !== hidee.firstChildClassName
			) {
				return false;
			}
		}

		return true;
	}

	private getOrCreateNodeHash(node: Element, hidee: Hidee): string {
		if (hidee.hash) return hidee.hash;

		const existingHash = node.getAttribute("hidee");
		if (existingHash) return existingHash;

		const hash = Object.entries(this.hiddenNodes).find(
			([, value]) => value.slug === hidee.slug,
		)?.[0];
		return hash || this.getUid();
	}

	private setNodeHash(node: Element, hash: string): void {
		node.setAttribute("hidee", hash);
	}

	private formatApplyStylesForStyle(applyStyles: ExtendedStyles): string {
		return Object.entries(applyStyles)
			.map(([style, value]) => `${style}: ${value} !important;`)
			.join(" ");
	}

	private getUid(): string {
		const randomPool = new Uint8Array(32);
		crypto.getRandomValues(randomPool);
		const hex = Array.from(randomPool, (b) =>
			b.toString(16).padStart(2, "0"),
		).join("");
		return `hider-${hex.substring(0, 58)}`;
	}

	private correctMenuHtml(shortName: string): string {
		return this.options.menuHtmlString.replace(
			"Show Section",
			`Show ${shortName}`,
		);
	}

	private styleAdder(styleInnerHtml: string, styleId: string): void {
		let style = document.createElement("style");
		style.innerHTML = styleInnerHtml;
		style.id = styleId;
		document.head.appendChild(style);
	}

	// Check if this is working
	private addCSS(cssId: string, url: string): void {
		console.log(url);
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