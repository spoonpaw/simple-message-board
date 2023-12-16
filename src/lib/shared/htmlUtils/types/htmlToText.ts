// src/lib/shared/htmlUtils/types/htmlToText.ts

export type ElementWithChildren = {
	type: string;
	name: string;
	children: ElementWithChildren[];
	_text: string;
};

export type Builder = {
	openBlock: (lineBreaks: number) => void;
	closeBlock: (lineBreaks: number) => void;
	text: (text: string) => void;
};

export type FormatOptions = {
	leadingLineBreaks: number;
	trailingLineBreaks: number;
};
