// src/lib/shared/htmlUtils/convertHtmlToPlainText.ts
import { convert } from 'html-to-text';
import type { HtmlToTextOptions, FormatCallback } from 'html-to-text';

function isBlockTextBuilder(builder: unknown): builder is { addInline: (text: string) => void } {
	return typeof builder === 'object' && builder !== null && 'addInline' in builder;
}

const skipFormatter: FormatCallback = (elem, walk, builder) => {
	if (elem.type === 'tag' && elem.name === 'img' && isBlockTextBuilder(builder)) {
		builder.addInline('[image]');
	}
};

export function convertHtmlToPlainText(html: string): string {
	const options: HtmlToTextOptions = {
		wordwrap: 130,
		selectors: [
			{ selector: 'img', format: 'skip' },
			{ selector: '*', format: 'inline' }
		],
		formatters: {
			'skip': skipFormatter
		}
	};

	return convert(html, options);
}
