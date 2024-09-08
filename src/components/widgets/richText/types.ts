/**
@file src/components/widgets/richText/types.ts
@description - Richtext TipTap widget types
*/

import { publicEnv } from '@root/config/public';

import { toStringHelper } from '@src/utils/utils';
import { Parser } from 'htmlparser2';

// Components
import IconifyPicker from '@components/IconifyPicker.svelte';
import Input from '@src/components/system/inputs/Input.svelte';
import Toggles from '@components/system/inputs/Toggles.svelte';
import PermissionsSetting from '@src/components/PermissionsSetting.svelte';

// Auth
import type { Permission } from '@src/auth/types';

/**
 * Defines RichText widget Parameters
 */
export type Params = {
	// default required parameters
	label: string;
	display?: DISPLAY;
	db_fieldName?: string;
	widget?: any;
	required?: boolean;
	translated?: boolean;
	icon?: string;
	helper?: string;
	width?: number;

	// Permissions
	permissions?: Permission[];

	// Widget Specific parameters
	// media_folder: (typeof publicEnv.FOLDERS)[number];
};

/**
 * Defines RichText GuiSchema
 */

export const GuiSchema = {
	label: { widget: Input, required: true },
	display: { widget: Input, required: true },
	db_fieldName: { widget: Input, required: true },
	required: { widget: Toggles, required: false },
	translated: { widget: Toggles, required: false },
	icon: { widget: IconifyPicker, required: false },
	helper: { widget: Input, required: false },
	width: { widget: Input, required: false },

	// Permissions
	permissions: { widget: PermissionsSetting, required: false }

	// Widget Specific parameters
};

/**
 * Define RichText GraphqlSchema function
 */
export const GraphqlSchema: GraphqlSchema = ({ label, collection }) => {
	// Create a type name by combining the collection name and label
	const typeName = `${collection.name}_${label}`;

	// Return an object containing the type name and the GraphQL schema
	return {
		typeName,
		graphql: /* GraphQL */ `
		type ${typeName} {
			${publicEnv.AVAILABLE_CONTENT_LANGUAGES.map((contentLanguage) => `${contentLanguage}: String`).join('\n')}
		}
	`
	};
};

let parsed_text: any;
export function toString({ field, data }: { field: any; data: any }) {
	parsed_text = '';
	const parser = new Parser({
		ontext: (text) => {
			parsed_text += text.trim();
		}
	});

	return toStringHelper({
		field,
		data,
		path: (lang) => {
			parser.write(data.content[lang]);
			parser.end();
			return data.header[lang] + '\n' + parsed_text;
		}
	});
}
