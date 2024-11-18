export interface HiderOptions {
	log: boolean;
	hidees: Hidee[];
	excludedHidees: string[];
	menuClass: string;
	menuCss: string;
	menuHtmlString: string;
	hider_invisibility: boolean;
}

// TODO: C'mon now, this is so unwieldy!
export interface Hidee {
	domain: string;
	section: string;
	slug: string;
	shortName: string;
	style: HideeStyle;
	buttonStyle: ButtonStyle;
	cssSelector: string;
	description?: string; // Not used by hider itself, just metadata
	type?: string; // Not used by hider itself, just metadata
	location?: string; // Not used by hider itself, just metadata
	tags?: string; // Not used by hider itself, just metadata
	excludedPages?: string;
	includedPages?: string;
	checkMenu?: boolean;
	checkMenuPosition?: boolean;
	noMenu?: boolean;
	hash?: string;
	isShownByUser?: boolean;
	isOnExcludedPage?: boolean;
	previousStyles?: Record<string, string>;
}

export interface HideeStyle {
	maxHeight?: string;
	minHeight?: string;
	flexDirection?: string;
	backgroundColor?: string;
	borderRadius?: string;
	marginBottom?: string;
}

export interface ButtonStyle {
	backgroundColor?: string;
	color?: string;
}

export interface UniversalStyles {
	pointerEvents: string;
	cursor: string;
	display: string;
	flexDirection: string;
	border: string;
	boxShadow: string;
}

export interface ExtendedStyles extends UniversalStyles {
	maxHeight?: string;
	overflow?: string;
	paddingTop?: string;
	minHeight?: string;
	justifyContent?: string;
	backgroundColor?: string;
	borderStyle?: string;
	borderRadius?: string;
	marginBottom?: string;
}
