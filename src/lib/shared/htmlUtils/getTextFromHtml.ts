// src/lib/shared/htmlUtils/getTextFromHtml.ts

import { htmlToText, type HtmlToTextOptions } from 'html-to-text';
import type {Builder, ElementWithChildren, FormatOptions} from "$lib/shared/htmlUtils/types/htmlToText";

export function getTextFromHtml(htmlString: string): string {
	const options: HtmlToTextOptions = {
		wordwrap: null,
		selectors: [
			{
				selector: 'p',
				options: {
					format: (
						elem: ElementWithChildren,
						walk: (children: ElementWithChildren[], builder: Builder) => void,
						builder: Builder,
						formatOptions: FormatOptions
					) => {
						builder.openBlock(formatOptions.leadingLineBreaks);

						if (
							elem.children.length === 1 &&
							elem.children[0].type === 'tag' &&
							elem.children[0].name === 'br'
						) {
							// Do nothing for <p><br></p> to count it as zero characters
						} else {
							const textContent = elem._text.replace(/&nbsp;/g, ' ');
							builder.text(textContent);
						}

						builder.closeBlock(formatOptions.trailingLineBreaks);
					},
					leadingLineBreaks: 1,
					trailingLineBreaks: 1
				}
			}
			// ... other selectors
		]
	};

	const processedHtml = htmlString.replace(/ /g, '&nbsp;');
	return htmlToText(processedHtml, options).replace(/\s/g, ''); // Remove all whitespace to get character count
}
