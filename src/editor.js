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
} from "@wordpress/components";

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

	const status = useScript("https://checkout.freemius.com/checkout.min.js", {
		removeOnUnmount: false,
	});

	const resetAll = () => {
		setAttributes({ freemius: undefined });
	};

	const EnableCheckbox = () => (
		<CheckboxControl
			label={__("Open a Freemius Checkout with this button.", "freemius")}
			checked={freemius_enabled}
			onChange={(val) => setAttributes({ freemius_enabled: val })}
		/>
	);

	const previewCheckout = () => {
		const { plugin_id, public_key } = attributes.freemius;
		if (!plugin_id || !public_key) {
			alert("Please fill in plugin_id and public_key");
			return;
		}
		// do not modify the original object
		const freemius_copy = { ...freemius };

		const handler = FS.Checkout.configure({
			plugin_id: plugin_id,
			public_key: public_key,
		});

		if (freemius.cancel) {
			freemius_copy.cancel = function () {
				new Function(freemius.cancel).apply(this);
			};
		}
		if (freemius.purchaseCompleted) {
			freemius_copy.purchaseCompleted = function (data) {
				new Function("data", freemius.purchaseCompleted).apply(this, [data]);
			};
		}
		if (freemius.success) {
			freemius_copy.success = function (data) {
				new Function("data", freemius.success).apply(this, [data]);
			};
		}
		if (freemius.track) {
			freemius_copy.track = function (event, data) {
				new Function("event", "data", freemius.track).apply(this, [
					event,
					data,
				]);
			};
		}

		handler.open(freemius_copy);
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

	return (
		<InspectorControls>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						label={__("Preview Checkout", "freemius")}
						onClick={previewCheckout}
					/>
				</ToolbarGroup>
			</BlockControls>
			<ToolsPanel
				label={__("Freemius Button", "freemius")}
				resetAll={resetAll}
				shouldRenderPlaceholderItems={true}
			>
				<PanelDescription>
					<EnableCheckbox />
					<Button onClick={previewCheckout} variant="secondary">
						{__("Preview Checkout", "freemius")}
					</Button>
				</PanelDescription>

				<FsToolItem
					label={__("plugin_id", "freemius")}
					id="plugin_id"
					help={__(
						"Required product ID (whether it's a plugin, theme, add-on, bundle, or SaaS).",
						"freemius"
					)}
					isShownByDefault
					{...props}
				/>

				<FsToolItem
					label={__("public_key", "freemius")}
					id="public_key"
					help={__("Require product public key.", "freemius")}
					isShownByDefault
					{...props}
				/>

				<FsToolItem
					label={__("id", "freemius")}
					id="id"
					help={__(
						"An optional ID to set the id attribute of the checkout's body HTML element. This argument is particularly useful if you have multiple checkout instances that need to have a slightly different design or visibility of UI components. You can assign a unique ID for each instance and customize it differently using the CSS stylesheet that you can attach through the PLANS - CUSTOMIZATION in the Developer Dashboard.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("name", "freemius")}
					id="name"
					help={__(
						"An optional string to override the product's title.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("title", "freemius")}
					id="title"
					help={__(
						"An optional string to override the checkout's title when buying a new license.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("subtitle", "freemius")}
					id="subtitle"
					isDeprecated
					help={__(
						"This has been deprecated and removed in the new phase2 Checkout (more on it below). An optional string to override the checkout's subtitle.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("image", "freemius")}
					id="image"
					help={__(
						"An optional icon that loads at the checkout and will override the product's icon uploaded to the Freemius Dashboard. Use a secure path to the image over HTTPS. While the checkout will remain PCI compliant, credit-card automatic prefill by the browser will not work.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("plan_id", "freemius")}
					id="plan_id"
					help={__(
						"The ID of the plan that will load with the checkout. When selling multiple plans you can set the param when calling the open() method.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("licenses", "freemius")}
					id="licenses"
					help={__(
						"A multi-site licenses prices that will load immediately with the checkout. A developer-friendly param that can be used instead of the pricing_id. To specify unlimited licenses prices, use one of the following values: 0, null, or 'unlimited'.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("disable_licenses_selector", "freemius")}
					id="disable_licenses_selector"
					help={__(
						"Set this param to true if you like to disable the licenses selector when the product is sold with multiple license activation options.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("hide_licenses", "freemius")}
					id="hide_licenses"
					help={__(
						"Set this param to true if you like to entirely hide the 3rd row in the header with the license selector.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("pricing_id", "freemius")}
					id="pricing_id"
					help={__(
						"Use the licenses param instead. An optional ID of the exact multi-site license prices that will load once the checkout opened.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("billing_cycle", "freemius")}
					id="billing_cycle"
					help={__(
						"An optional billing cycle that will be auto selected when the checkout is opened. Can be one of the following values: 'monthly', 'annual', 'lifetime'.",
						"freemius"
					)}
					options={[
						{ auto: "automatic" },
						{ monthly: "monthly" },
						{ annual: "annual" },
						{ lifetime: "lifetime" },
					]}
					{...props}
				/>

				<FsToolItem
					label={__("hide_billing_cycles", "freemius")}
					id="hide_billing_cycles"
					isDeprecated
					help={__(
						"This has been deprecated and removed in phase2 Checkout, with the introduction of show_upsells. Set this param to true if you like to hide the billing cycles selector when the product is sold in multiple billing frequencies.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("currency", "freemius")}
					id="currency"
					help={__(
						"One of the following 3-char currency codes (ISO 4217) or 'auto': 'usd', 'eur', 'gbp'. You could set the parameter to 'auto' to let the checkout automatically choose the currency based on the geolocation of the user. If you decide to choose the 'auto' option, you may also want to dynamically show the prices on your pricing page according to the user's geo. Therefore, we created checkout.freemius.com/geo.json to allow you to identify the browser's geo and currency that the checkout will use by default.",
						"freemius"
					)}
					options={[
						{ auto: "automatic" },
						{ usd: "usd" },
						{ eur: "eur" },
						{ gbp: "gbp" },
					]}
					{...props}
				/>

				<FsToolItem
					label={__("default_currency", "freemius")}
					id="default_currency"
					help={__(
						"You could use this when the 'currency' param is set to 'auto'. In this case, if the auto-detected currency is not associated with any pricing, this will be the fallback currency.",
						"freemius"
					)}
					options={[{ usd: "usd" }, { eur: "eur" }, { gbp: "gbp" }]}
					{...props}
				/>

				<FsToolItem
					label={__("coupon", "freemius")}
					id="coupon"
					help={__(
						"An optional coupon code to be automatically applied on the checkout immediately when opened.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("hide_coupon", "freemius")}
					id="hide_coupon"
					help={__(
						"Set this param to true if you pre-populate a coupon and like to hide the coupon code and coupon input field from the user.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("maximize_discounts", "freemius")}
					id="maximize_discounts"
					isDeprecated
					help={__(
						"This has been deprecated in favor of bundle_discount introduced in phase2 Checkout. Set this param to false when selling a bundle and you want the discounts to be based on the closest licenses quota and billing cycle from the child products. Unlike the default discounts calculation which is maximized by basing the discounts on the child products single-site prices.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("trial", "freemius")}
					id="trial"
					help={__(
						"When set to true, it will open the checkout in a trial mode and the trial type (free vs. paid) will be based on the plan's configuration. This will only work if you've activated the Free Trial functionality in the plan configuration. If you configured the plan to support a trial that doesn't require a payment method, you can also open the checkout in a trial mode that requires a payment method by setting the value to 'paid'.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("cancel", "freemius")}
					id="cancel"
					help={__(
						"A callback handler that will execute once a user closes the checkout by clicking the close icon. This handler only executes when the checkout is running in a dialog mode.",
						"freemius"
					)}
					type="code"
					{...props}
				/>

				<FsToolItem
					label={__("purchaseCompleted", "freemius")}
					id="purchaseCompleted"
					help={__(
						"An after successful purchase/subscription completion callback handler.",
						"freemius"
					)}
					type="code"
					{...props}
				/>

				<FsToolItem
					label={__("success", "freemius")}
					id="success"
					help={__(
						"An optional callback handler, similar to purchaseCompleted. The main difference is that this callback will only execute after the user clicks the “Got It”” button that appears in the after purchase screen as a declaration that they successfully received the after purchase email. This callback is obsolete when the checkout is running in a dashboard mode.”",
						"freemius"
					)}
					type="code"
					{...props}
				/>

				<FsToolItem
					label={__("track", "freemius")}
					id="track"
					help={__(
						"An optional callback handler for advanced tracking, which will be called on multiple checkout events such as updates in the currency, billing cycle, licenses #, etc.",
						"freemius"
					)}
					type="code"
					{...props}
				/>

				<FsToolItem
					label={__("license_key", "freemius")}
					id="license_key"
					help={__(
						"An optional param to pre-populate a license key for license renewal, license extension and more.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("hide_license_key", "freemius")}
					id="hide_license_key"
					help={__(
						"Set this param to true if you like to hide the option to manually enter a license key during checkout for existing license renewal.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("is_payment_method_update", "freemius")}
					id="is_payment_method_update"
					help={__(
						"An optional param to load the checkout for a payment method update. When set to `true`, the license_key param must be set and associated with a non-canceled subscription.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("user_email", "freemius")}
					id="user_email"
					help={__(
						"An optional string to prefill the buyer's email address.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("user_firstname", "freemius")}
					id="user_firstname"
					help={__(
						"An optional string to prefill the buyer's first name.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("user_lastname", "freemius")}
					id="user_lastname"
					help={__(
						"An optional string to prefill the buyer's last name.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("readonly_user", "freemius")}
					id="readonly_user"
					help={__(
						"Set this parameter to true to make the user details (name and email) readonly. This is useful for SaaS integration where you are loading the user email and their first and last name from your own DB.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("affiliate_user_id", "freemius")}
					id="affiliate_user_id"
					help={__(
						"An optional user ID to associate purchases generated through the checkout with their affiliate account.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("locale", "freemius")}
					id="locale"
					help={__(
						"If given the Checkout will load in the selected language and would also show an UI for the user to switch language. The value of the language or locale parameter could be one of the followings:",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("user_token", "freemius")}
					id="user_token"
					help={__(
						"An optional token which if present, would pre-populate the checkout with user's personal and billing data (for example, the name, email, country, vat ID etc).",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("layout", "freemius")}
					id="layout"
					help={__(
						"Specify the layout of the form on a larger screen. This cannot be horizontal in cases like payment method updates or free plans. If set  null the system will automatically choose the best default for the current checkout mode.",
						"freemius"
					)}
					options={[
						{ auto: "auto" },
						{ vertical: "vertical" },
						{ horizontal: "horizontal" },
					]}
					{...props}
				/>

				<FsToolItem
					label={__("form_position", "freemius")}
					id="form_position"
					help={__(
						"Specifies the position of the form in horizontal layout.",
						"freemius"
					)}
					options={[{ left: "left" }, { right: "right" }]}
					{...props}
				/>

				<FsToolItem
					label={__("fullscreen", "freemius")}
					id="fullscreen"
					help={__(
						"If set to true, the Checkout dialog will take the entire screen when opened.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("show_upsells", "freemius")}
					id="show_upsells"
					he
					{...props}
					lp={__("Whether or not showing the upsell toggles.", "freemius")}
				/>

				<FsToolItem
					label={__("show_reviews", "freemius")}
					id="show_reviews"
					help={__(
						"Whether or not showing featured reviews in the checkout. By default it will be shown if the checkout page is loaded directly, without any JS snippet (iFrame) integration call.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("review_id", "freemius")}
					id="review_id"
					help={__(
						"When showing the review UI in the checkout, you can specify which review you want to show with its ID. By default the latest featured review will be shown.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("show_refund_badge", "freemius")}
					id="show_refund_badge"
					help={__(
						"Whether or not showing Refund Policy UI in the checkout. By default it will be shown if the checkout page is loaded directly, without any JS snippet (iFrame) integration call.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("refund_policy_position", "freemius")}
					id="refund_policy_position"
					help={__(
						"Use the parameter to position the refund policy badge when showing the form in horizontal layout. By default with the 'dynamic' value it will be positioned either below the form or the breakdown column. But with static value you have full control.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("annual_discount", "freemius")}
					id="annual_discount"
					help={__(
						"Determines whether the annual discount will be shown in the checkout.  ",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("show_monthly_switch", "freemius")}
					id="show_monthly_switch"
					help={__(
						"Switching to the monthly billing cycle is disabled when the Checkout is loaded with annual billing cycle. Use this parameter to show it.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("multisite_discount", "freemius")}
					id="multisite_discount"
					help={__(
						"Determines whether the multi-site discount will be shown. When the value is auto, the discount will only be shown if the single license pricing difference does not exceed 10 times more than the current pricing.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("bundle_discount", "freemius")}
					id="bundle_discount"
					help={__(
						"Determines whether the bundle discount will be shown. The bundle discount itself depends on the compound price of its children. By default with maximize, we try to take the compound price from the lowest billing cycle and license. But with the value of true, we take it from the closest billing cycle and licenses.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("show_inline_currency_selector", "freemius")}
					id="show_inline_currency_selector"
					help={__(
						"Set it to false to hide the inline currency selector from the “Today's Total” line.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("cancel_url", "freemius")}
					id="cancel_url"
					help={__(
						"When the checkout is loaded in page you can specify a cancel URL to be used for the back button. By default if you link Freemius Checkout from your website, it will be picked up from the Referer header (if present). Using this option you can override the URL as needed.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("cancel_icon", "freemius")}
					id="cancel_icon"
					help={__(
						"By default the website icon (also known as favicon) will be rendered alongside the cancel button. If you want to use any other icon image, please specify the link to the icon using this parameter.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("always_show_renewals_amount", "freemius")}
					id="always_show_renewals_amount"
					help={__(
						"When set to true, a small line mentioning the total renewal price per billing cycle will shown below the total. By default, it only shows up when there is a renewal discount involved.",
						"freemius"
					)}
					{...props}
				/>

				<FsToolItem
					label={__("is_bundle_collapsed", "freemius")}
					id="is_bundle_collapsed"
					help={__(
						"Determines whether the products in a bundle appear as hidden by default. Is applicable only to bundles.",
						"freemius"
					)}
					{...props}
				/>
			</ToolsPanel>
		</InspectorControls>
	);
};

const FsToolItem = (props) => {
	const {
		label,
		id,
		help,
		type,
		options,
		link,
		isDeprecated,
		attributes,
		setAttributes,
	} = props;

	const setOption = (key, values) => {
		let newValue = { ...attributes.freemius };
		newValue[key] = values;
		// remove entries which are the default value from Attributes
		Object.keys(newValue).forEach((key) => {
			if (Attributes[key] === newValue[key]) {
				delete newValue[key];
			}
		});

		setAttributes({ freemius: newValue });
		//setAttributes({ freemius: { ...attributes.freemius, ...options } });
	};
	const value =
		undefined !== attributes.freemius[id] ? attributes.freemius[id] : undefined;

	let type_of = type || typeof Attributes[id];
	if (options) {
		type_of = "select";
	}
	let the_link =
		link ||
		"https://freemius.com/help/documentation/selling-with-freemius/freemius-checkout-buy-button/#" +
			id;
	let the_label = label;
	if (isDeprecated) {
		the_label += " (deprecated)";
	}

	return (
		<ToolsPanelItem
			hasValue={() => !!value}
			label={label}
			onDeselect={() => setOption(id, undefined)}
			isShownByDefault
		>
			<BaseControl>
				<ExternalLink className="freemius-link" href={the_link} />
				{(() => {
					switch (type_of) {
						case "boolean":
							return (
								<CheckboxControl
									checked={value}
									label={the_label}
									help={help}
									onChange={(val) => setOption(id, val)}
								/>
							);

						case "number":
							return (
								<NumberControl
									value={value}
									label={the_label}
									help={help}
									onChange={(val) => setOption(id, val)}
								/>
							);

						case "select":
							return (
								<SelectControl
									value={value}
									label={the_label}
									help={help}
									onChange={(val) => setOption(id, val)}
									options={options.map((o, i) => {
										const [key, value] = Object.entries(o)[0];
										return { label: key, value: value };
									})}
								/>
							);
						case "code":
							return (
								<TextareaControl
									value={value}
									label={the_label}
									help={help}
									onChange={(val) => setOption(id, val)}
								/>
							);
						default:
							return (
								<TextControl
									value={value}
									label={the_label}
									help={help}
									onChange={(val) => setOption(id, val)}
								/>
							);
					}
				})()}
			</BaseControl>
		</ToolsPanelItem>
	);
};

const generateClassName = (attributes) => {
	const { plugin_id } = attributes.freemius;
	let string = "";
	if (plugin_id) {
		string += `has-freemius-checkout has-freemius-checkout-${plugin_id}`;
	}
	return string;
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
			default: Attributes,
		},
	},
	classNameGenerator: generateClassName,
	inlineStyleGenerator: () => null,
	Edit: BlockEdit,
});
