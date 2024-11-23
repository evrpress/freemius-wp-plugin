/**
 * External dependencies
 */
import styled from "@emotion/styled";
/**
 * WordPress dependencies
 */

import { __ } from "@wordpress/i18n";
import { registerBlockExtension, useScript } from "@10up/block-components";

import { InspectorControls, BlockControls } from "@wordpress/block-editor";
import {
	BaseControl,
	SelectControl,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalNumberControl as NumberControl,
	TextControl,
	CheckboxControl,
	PanelBody,
	ExternalLink,
	Button,
	TextareaControl,
	ToolbarButton,
	ToolbarGroup,
	TabPanel,
	Tip,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { useState, useEffect, useRef } from "@wordpress/element";
import { useEntityProp } from "@wordpress/core-data";
import { Icon, globe, page, button, handle } from "@wordpress/icons";

/**
 * Internal dependencies
 */

import "./editor.scss";
import { Attributes } from "./attributes";

const PanelDescription = styled.div`
	grid-column: span 2;
`;

const BlockEdit = (props) => {
	const { attributes, setAttributes } = props;

	const { freemius_enabled, freemius } = attributes;

	const [preview, setPreview] = useState(false);
	const [FS, setFS] = useState();
	const [handler, setHandler] = useState();
	const [isLoading, setLoading] = useState(false);

	const [scope, setScope] = useState("button");
	const postType = useSelect((select) =>
		select("core/editor").getCurrentPostType(),
	);
	const [pageMeta, setPageMeta] = useEntityProp("postType", postType, "meta");
	const [settings, setSettings] = useEntityProp(
		"root",
		"site",
		"freemius_button",
	);
	const schema = freemius_button_schema;

	useEffect(() => {
		if (preview) {
			openCheckout();
		} else {
			closeCheckout();
		}
	}, [preview]);

	const resetAll = (scope) => {
		switch (scope) {
			case "global":
				setSettings({});
				break;
			case "page":
				setPageMeta({ freemius_button: {} });
				break;
			default:
				setAttributes({ freemius: undefined });
		}
	};

	const EnableCheckbox = () => (
		<CheckboxControl
			__nextHasNoMarginBottom
			label={__("Freemius Checkout.", "freemius")}
			checked={freemius_enabled}
			onChange={(val) => setAttributes({ freemius_enabled: val })}
		/>
	);

	// load script in the iframe
	useEffect(() => {
		const iframe = document.querySelector('iframe[name="editor-canvas"]');
		const iframeDoc = iframe.contentDocument;
		const s = iframeDoc.createElement("script");
		s.type = "text/javascript";
		s.src = "https://checkout.freemius.com/js/v1/";
		s.onload = () => setFS(iframe.contentWindow.FS);

		iframeDoc.body.appendChild(s);
	}, []);

	useEffect(() => {
		if (!preview) return;

		const t = setTimeout(() => {
			console.log("SETTing changed");
			closeCheckout();
			openCheckout();
		}, 200);

		return () => clearTimeout(t);
	}, [settings, pageMeta.freemius_button, freemius]);

	const closeCheckout = () => {
		if (!handler) return;

		handler && handler.close();

		const iframe = document.querySelector('iframe[name="editor-canvas"]');
		const iframeDoc = iframe.contentDocument;

		iframeDoc.getElementById("fs-checkout-page-" + handler.guid)?.remove();
		iframeDoc.getElementById("fs-loader-" + handler.guid)?.remove();
		iframeDoc.getElementById("fs-exit-intent-" + handler.guid)?.remove();

		document.body.classList.remove("freemius-checkout-preview");

		setLoading(false);
	};

	const openCheckout = () => {
		// build arguments starting from global, page and button
		const args = {
			...settings,
			...pageMeta.freemius_button,
			...freemius,
		};

		const { plugin_id, public_key } = args;
		if (!plugin_id || !public_key) {
			alert("Please fill in plugin_id and public_key");
			return;
		}

		// do not modify the original object
		const args_copy = { ...args };

		//add class to the body
		document.body.classList.add("freemius-checkout-preview");

		const handler = new FS.Checkout({
			plugin_id: plugin_id,
			public_key: public_key,
		});

		const errorTimeout = setTimeout(() => {
			const iframe = document.querySelector('iframe[name="editor-canvas"]');
			const iframeDoc = iframe.contentDocument;

			alert(
				"Freemius Checkout is not available. It's most likely a settings is wrong:\n" +
					iframeDoc.body.innerHTML,
			);
			// handler.close(); not working
			errorTimeout && clearTimeout(errorTimeout);
			setPreview(false);
		}, 5000);

		args_copy.cancel = function () {
			errorTimeout && clearTimeout(errorTimeout);
			setPreview(false);
			if (args.cancel) {
				new Function(args.cancel).apply(this);
			}
		};

		if (args.purchaseCompleted) {
			args_copy.purchaseCompleted = function (data) {
				new Function("data", args.purchaseCompleted).apply(this, [data]);
			};
		}
		if (args.success) {
			args_copy.success = function (data) {
				new Function("data", args.success).apply(this, [data]);
			};
		}

		args_copy.track = function (event, data) {
			errorTimeout && clearTimeout(errorTimeout);
			setLoading(false);

			if (args.track) {
				new Function("event", "data", args.track).apply(this, [event, data]);
			}
		};

		handler.open(args_copy);

		setHandler(handler);
		setLoading(true);
	};

	const getValueFor = (key, scope) => {
		switch (scope) {
			case "global":
				return settings?.[key];
			case "page":
				return pageMeta?.freemius_button?.[key];
			case "button":
			default:
				return freemius?.[key];
		}
	};

	const getPlaceholderFor = (key, scope) => {
		switch (scope) {
			case "global":
				return "";
			case "page":
				return getValueFor(key, "global") || "";
			case "button":
				return getValueFor(key, "page") || getValueFor(key, "global") || "";
			default:
				return "";
		}
	};

	const onChangeHandler = (scope, key, val) => {
		let newValue;

		switch (scope) {
			case "global":
				newValue = { ...settings };
				break;
			case "page":
				newValue = { ...pageMeta.freemius_button };
				break;
			default:
				newValue = { ...freemius };
		}

		newValue[key] = val;

		// remove entries which are the default value from Attributes

		switch (scope) {
			case "global":
				setSettings(newValue);
				break;
			case "page":
				setPageMeta({ freemius_button: newValue });
				break;
			default:
				setAttributes({ freemius: newValue });
		}
	};

	if (!freemius_enabled) {
		return (
			<InspectorControls>
				<PanelBody title={__("Freemius Button", "freemius")}>
					<EnableCheckbox />
				</PanelBody>
			</InspectorControls>
		);
	}

	const MyTip = (props) => {
		const { scope } = props;
		const { children } = props;
		let text = "";
		let icon = button;
		switch (scope) {
			case "global":
				text = __("Changes will affect the whole site.", "freemius");
				icon = globe;
				break;
			case "page":
				text = __("Changes will affect the whole page.", "freemius");
				icon = page;
				break;
			case "button":
				text = __("Changes will affect only this button.", "freemius");
				icon = button;
				break;
		}

		const className =
			"components-scope-indicator components-scope-indicator-" + scope;

		return (
			<div className={className}>
				<Icon icon={icon} />
				<p>{text}</p>
			</div>
		);
	};

	const scopes = [
		{
			name: "global",
			title: "Global",
		},
		{
			name: "page",
			title: "Page",
		},
		{
			name: "button",
			title: "Button",
		},
	];

	return (
		<InspectorControls>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__("Preview Checkout", "freemius")}
						icon={"visibility"}
						onClick={() => setPreview(true)}
					/>
				</ToolbarGroup>
			</BlockControls>
			<ToolsPanel
				className={"freemius-button-scope-" + scope}
				resetAll={() => resetAll(scope)}
				label={
					__("Freemius Button", "freemius") +
					" - (" +
					scopes.filter((s) => s.name === scope)[0].title +
					")"
				}
			>
				<PanelDescription>
					<EnableCheckbox />
					<Button
						onClick={() => setPreview(!preview)}
						icon={"visibility"}
						isBusy={isLoading}
						disabled={isLoading}
						isPressed={preview}
						variant="secondary"
					>
						{preview && !isLoading
							? __("Close Preview", "freemius")
							: __("Preview Checkout", "freemius")}
					</Button>
				</PanelDescription>
				<TabPanel
					className="freemius-button-scopes"
					activeClass="active-tab"
					initialTabName="button"
					onSelect={(val) => {
						setScope(val);
					}}
					tabs={scopes}
				>
					{(tab) => <MyTip scope={scope} />}
				</TabPanel>

				<div className="freemius-button-scopes-wrap">
					{Object.keys(schema).map((key) => {
						const item = schema[key];

						const value = getValueFor(key, scope);
						const placeholder = getPlaceholderFor(key, scope);

						const onChangeHandlerHelper = (val) => {
							if (item.default === val) {
								val = undefined;
							}
							onChangeHandler(scope, key, val);
						};

						return (
							<FsToolItem
								key={key}
								label={item.label || key}
								options={item.options}
								id={key}
								scope={scope}
								help={item.help}
								code={item?.code}
								defaultValue={item.default}
								isDeprecated={item.isDeprecated}
								isRequired={item.isRequired}
								value={value}
								placeholder={placeholder}
								type={item.type || "string"}
								onChange={onChangeHandlerHelper}
							/>
						);
					})}
				</div>
			</ToolsPanel>
		</InspectorControls>
	);
};

const generateClassName = (attributes) => {
	const { freemius_enabled, freemius } = attributes;

	if (!freemius_enabled) return "";

	return "has-freemius-checkout";
};

registerBlockExtension(["core/button"], {
	extensionName: "freemius-form-button",
	attributes: {
		freemius_enabled: {
			type: "boolean",
			default: false,
		},
		freemius: {
			type: "object",
		},
	},
	classNameGenerator: generateClassName,
	inlineStyleGenerator: () => null,
	Edit: BlockEdit,
});

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

	const overwrite = "";
	let the_label = label;
	const the_link =
		link ||
		"https://freemius.com/help/documentation/selling-with-freemius/freemius-checkout-buy-button/#" +
			id;
	const inherited = !!placeholder && value == undefined;
	let the_type = type;
	if (options) {
		the_type = "array";
	} else if (code) {
		the_type = "code";
	}

	if (inherited) {
		the_label += " (inherited)";
	} else if (isRequired) {
		the_label += " (required)";
	}
	if (isDeprecated) {
		the_label += " (deprecated)";
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
			<BaseControl help={overwrite} __nextHasNoMarginBottom>
				<ExternalLink className="freemius-link" href={the_link} />
				{(() => {
					switch (the_type) {
						case "boolean":
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

						case "integer":
						case "number":
							return (
								<NumberControl
									value={value || ""}
									label={the_label}
									help={help}
									spinControls="none"
									min={0}
									placeholder={placeholder ? "[" + placeholder + "]" : ""}
									onChange={onChangeHandler}
								/>
							);

						case "array":
							return (
								<SelectControl
									__nextHasNoMarginBottom
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
						case "code":
							return (
								<TextareaControl
									__nextHasNoMarginBottom
									value={value || ""}
									label={the_label}
									help={help}
									placeholder={placeholder ? "[" + placeholder + "]" : ""}
									onChange={onChangeHandler}
									rows={value ? 10 : 3}
								/>
							);
						default:
							return (
								<>
									<TextControl
										__nextHasNoMarginBottom
										value={value || ""}
										label={the_label}
										help={help}
										placeholder={placeholder ? "[" + placeholder + "]" : ""}
										onChange={onChangeHandler}
									/>
								</>
							);
					}
				})()}
			</BaseControl>
		</ToolsPanelItem>
	);
};
