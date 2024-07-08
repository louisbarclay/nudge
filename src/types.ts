export interface HiderOptions {
	log: boolean;
	hidees: Hidee[];
	excludedHidees: string[];
	menuClass: string;
	menuCss: string;
	menuHtmlString: string;
	supportLink: string;
	hider_invisibility: boolean;
}

// TODO: C'mon now, this is so unwieldy!
export interface Hidee {
	slug: string;
	domain: string;
	id?: string;
	className?: string;
	shortName: string;
	section?: string; // This is presumably in the spreadsheet but not used!
	style: HideeStyle;
	description?: string; // Not used by hider itself, just metadata
	type?: string; // Not used by hider itself, just metadata
	page?: string; // Hm, think this is deprecated...in favour of ignorePages and includePages
	location?: string; // Not used by hider itself, just metadata
	tags?: string; // Not used by hider itself, just metadata
	ignorePages?: string;
	includePages?: string;
	parentClassName?: string;
	parentParentClassName?: string;
	customAttributeName?: string;
	customAttributeValue?: string;
	tagName?: string;
	classNameExactMatch?: boolean;
	innerText?: string;
	firstChildId?: string;
	firstChildClassName?: string;
	childIndex?: number;
	parentLevels?: number;
	closestParentClass?: string;
	checkMenu?: boolean;
	checkMenuPosition?: boolean;
	noMenu?: boolean;
	applyId?: boolean;
	setIntervalMethod?: boolean;
	hash?: string;
	excluded?: boolean;
	ignored?: boolean;
}

export interface HideeStyle {
	maxHeight?: string;
	minHeight?: string;
	flexDirection?: string;
	backgroundColor?: string;
	borderRadius?: string;
	marginBottom?: string;
}

export interface UniversalStyles {
	pointerEvents: string;
	cursor: string;
	display: string;
	flexDirection: string;
}

export interface ExtendedStyles extends UniversalStyles {
	maxHeight?: string;
	overflow?: string;
	paddingTop?: string;
	minHeight?: string;
	justifyContent?: string;
	backgroundColor?: string;
	boxShadow?: string;
	borderStyle?: string;
	borderRadius?: string;
	marginBottom?: string;
}
