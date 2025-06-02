/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BaseControl,
	SelectControl,
	TextControl,
	CheckboxControl,
	ExternalLink,
	TextareaControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';

const FsToolItem = (props) => {
	const {
		label,
		id,
		help,
		type,
		options,
		link,
		isDeprecated,
		isRequired,
		placeholder,
		value,
		code,
		onChange,
		defaultValue,
	} = props;

	const overwrite = '';
	let the_label = label;
	const the_link =
		link ||
		'https://freemius.com/help/documentation/selling-with-freemius/freemius-checkout-buy-button/#' +
			id;
	const inherited = !!placeholder && value == undefined;
	let the_type = type;
	if (options) {
		the_type = 'array';
	} else if (code) {
		the_type = 'code';
	}

	if (inherited) {
		the_label += ' (' + __('inherited', 'freemius') + ')';
	} else if (isRequired) {
		the_label += ' (' + __('required', 'freemius') + ')';
	}
	if (isDeprecated) {
		the_label += ' (' + __('deprecated', 'freemius') + ')';
	}

	const onChangeHandler = (val) => {
		if (onChange) {
			onChange(val);
		}
	};

	return (
		<ToolsPanelItem
			className="freemius-button-scope"
			hasValue={() => {
				return value != undefined || inherited;
			}}
			label={label}
			onDeselect={() => onChangeHandler(undefined)}
			isShownByDefault={isRequired}
		>
			<BaseControl __nextHasNoMarginBottom help={overwrite}>
				<ExternalLink className="freemius-link" href={the_link} />
				{(() => {
					switch (the_type) {
						case 'boolean':
							return (
								<CheckboxControl
									__nextHasNoMarginBottom
									checked={value != undefined ? value : defaultValue}
									label={the_label}
									help={help}
									indeterminate={!!placeholder && value == undefined}
									onChange={(val) => {
										onChangeHandler(val);
									}}
								/>
							);

						case 'integer':
						case 'number':
							return (
								<NumberControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									value={value || ''}
									label={the_label}
									help={help}
									spinControls="none"
									min={0}
									placeholder={placeholder ? '[' + placeholder + ']' : ''}
									onChange={onChangeHandler}
								/>
							);

						case 'array':
							return (
								<SelectControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									value={value}
									label={the_label}
									help={help}
									onChange={onChangeHandler}
									options={Object.keys(options).map((key) => {
										const label = options[key];
										return { label: label, value: key };
									})}
								/>
							);
						case 'code':
							return (
								<TextareaControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									value={value || ''}
									label={the_label}
									help={help}
									placeholder={placeholder ? '[' + placeholder + ']' : ''}
									onChange={onChangeHandler}
									rows={value ? 10 : 3}
								/>
							);
						default:
							return (
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									value={value || ''}
									label={the_label}
									help={help}
									placeholder={placeholder ? '[' + placeholder + ']' : ''}
									onChange={onChangeHandler}
								/>
							);
					}
				})()}
			</BaseControl>
		</ToolsPanelItem>
	);
};

export default FsToolItem;
