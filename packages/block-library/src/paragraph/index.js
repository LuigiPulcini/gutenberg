/**
 * External dependencies
 */
import classnames from 'classnames';
import { isFinite, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	RawHTML,
} from '@wordpress/element';
import {
	getColorClassName,
	getFontSizeClass,
	RichText,
} from '@wordpress/editor';
import {
	getPhrasingContentSchema,
	children,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import edit from './edit';

const supports = {
	className: false,
};

const schema = {
	content: {
		type: 'array',
		source: 'children',
		selector: 'p',
		default: [],
	},
	align: {
		type: 'string',
	},
	dropCap: {
		type: 'boolean',
		default: false,
	},
	placeholder: {
		type: 'string',
	},
	textColor: {
		type: 'string',
	},
	customTextColor: {
		type: 'string',
	},
	backgroundColor: {
		type: 'string',
	},
	customBackgroundColor: {
		type: 'string',
	},
	fontSize: {
		type: 'string',
	},
	customFontSize: {
		type: 'number',
	},
};

export const name = 'core/paragraph';

export const settings = {
	title: __( 'Paragraph' ),

	description: __( 'Add some basic text.' ),

	icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0,0h24v24H0V0z" fill="none" /><polygon points="21 11.01 3 11 3 13 21 13" /><rect x="3" y="16" width="12" height="2" /><polygon points="21 6 3 6 3 8.01 21 8" /></svg>,

	category: 'common',

	keywords: [ __( 'text' ) ],

	supports,

	attributes: schema,

	transforms: {
		from: [
			{
				type: 'raw',
				// Paragraph is a fallback and should be matched last.
				priority: 20,
				selector: 'p',
				schema: {
					p: {
						children: getPhrasingContentSchema(),
					},
				},
			},
		],
	},

	deprecated: [
		{
			supports,
			attributes: {
				...schema,
				width: {
					type: 'string',
				},
			},
			save( { attributes } ) {
				const {
					width,
					align,
					content,
					dropCap,
					backgroundColor,
					textColor,
					customBackgroundColor,
					customTextColor,
					fontSize,
					customFontSize,
				} = attributes;

				const textClass = getColorClassName( 'color', textColor );
				const backgroundClass = getColorClassName( 'background-color', backgroundColor );
				const fontSizeClass = fontSize && `is-${ fontSize }-text`;

				const className = classnames( {
					[ `align${ width }` ]: width,
					'has-background': backgroundColor || customBackgroundColor,
					'has-drop-cap': dropCap,
					[ fontSizeClass ]: fontSizeClass,
					[ textClass ]: textClass,
					[ backgroundClass ]: backgroundClass,
				} );

				const styles = {
					backgroundColor: backgroundClass ? undefined : customBackgroundColor,
					color: textClass ? undefined : customTextColor,
					fontSize: fontSizeClass ? undefined : customFontSize,
					textAlign: align,
				};

				return (
					<RichText.Content
						tagName="p"
						style={ styles }
						className={ className ? className : undefined }
						value={ content }
					/>
				);
			},
		},
		{
			supports,
			attributes: omit( {
				...schema,
				fontSize: {
					type: 'number',
				},
			}, 'customFontSize', 'customTextColor', 'customBackgroundColor' ),
			save( { attributes } ) {
				const { width, align, content, dropCap, backgroundColor, textColor, fontSize } = attributes;
				const className = classnames( {
					[ `align${ width }` ]: width,
					'has-background': backgroundColor,
					'has-drop-cap': dropCap,
				} );
				const styles = {
					backgroundColor: backgroundColor,
					color: textColor,
					fontSize: fontSize,
					textAlign: align,
				};

				return <p style={ styles } className={ className ? className : undefined }>{ content }</p>;
			},
			migrate( attributes ) {
				return omit( {
					...attributes,
					customFontSize: isFinite( attributes.fontSize ) ? attributes.fontSize : undefined,
					customTextColor: attributes.textColor && '#' === attributes.textColor[ 0 ] ? attributes.textColor : undefined,
					customBackgroundColor: attributes.backgroundColor && '#' === attributes.backgroundColor[ 0 ] ? attributes.backgroundColor : undefined,
				}, [ 'fontSize', 'textColor', 'backgroundColor' ] );
			},
		},
		{
			supports,
			attributes: {
				...schema,
				content: {
					type: 'string',
					source: 'html',
				},
			},
			save( { attributes } ) {
				return <RawHTML>{ attributes.content }</RawHTML>;
			},
			migrate( attributes ) {
				return {
					...attributes,
					content: [
						<RawHTML key="html">{ attributes.content }</RawHTML>,
					],
				};
			},
		},
	],

	merge( attributes, attributesToMerge ) {
		return {
			content: children.concat(
				attributes.content,
				attributesToMerge.content
			),
		};
	},

	getEditWrapperProps( attributes ) {
		const { width } = attributes;
		if ( [ 'wide', 'full', 'left', 'right' ].indexOf( width ) !== -1 ) {
			return { 'data-align': width };
		}
	},

	edit,

	save( { attributes } ) {
		const {
			align,
			content,
			dropCap,
			backgroundColor,
			textColor,
			customBackgroundColor,
			customTextColor,
			fontSize,
			customFontSize,
		} = attributes;

		const textClass = getColorClassName( 'color', textColor );
		const backgroundClass = getColorClassName( 'background-color', backgroundColor );
		const fontSizeClass = getFontSizeClass( fontSize );

		const className = classnames( {
			'has-background': backgroundColor || customBackgroundColor,
			'has-drop-cap': dropCap,
			[ fontSizeClass ]: fontSizeClass,
			[ textClass ]: textClass,
			[ backgroundClass ]: backgroundClass,
		} );

		const styles = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
			color: textClass ? undefined : customTextColor,
			fontSize: fontSizeClass ? undefined : customFontSize,
			textAlign: align,
		};

		return (
			<RichText.Content
				tagName="p"
				style={ styles }
				className={ className ? className : undefined }
				value={ content }
			/>
		);
	},
};
