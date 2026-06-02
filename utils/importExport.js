import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const EXPORT_VERSION = 1;
const APP_NAME = 'AttendX';

// ─── Export ──────────────────────────────────────────────────────
/**
 * Bundles subjects + timetable into a JSON file and opens native share sheet.
 * @returns {{ success: boolean, error?: string }}
 */
export const exportData = async (subjects, timetable) => {
  try {
    const payload = {
      version: EXPORT_VERSION,
      app: APP_NAME,
      exportedAt: new Date().toISOString(),
      subjects,
      timetable,
    };

    const json = JSON.stringify(payload, null, 2);
    const fileName = `AttendX_${new Date().toISOString().slice(0, 10)}.json`;
    const filePath = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(filePath, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { success: false, error: 'Sharing is not available on this device.' };
    }

    await Sharing.shareAsync(filePath, {
      mimeType: 'application/json',
      dialogTitle: 'Share AttendX Data',
      UTI: 'public.json',
    });

    return { success: true };
  } catch (e) {
    console.error('exportData error:', e);
    return { success: false, error: e.message };
  }
};

// ─── Import ──────────────────────────────────────────────────────
/**
 * Opens document picker, reads and validates the JSON file.
 * @returns {{ success: boolean, data?: { subjects, timetable, exportedAt }, error?: string }}
 */
export const importData = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
    });

    // User cancelled
    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    const file = result.assets?.[0] ?? result;
    if (!file?.uri) {
      return { success: false, error: 'Could not read the selected file.' };
    }

    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { success: false, error: 'Invalid file format. Please select a valid AttendX export file.' };
    }

    // Validate structure
    if (parsed.app !== APP_NAME) {
      return { success: false, error: 'This file was not exported from AttendX.' };
    }
    if (!Array.isArray(parsed.subjects)) {
      return { success: false, error: 'Invalid data: subjects list missing.' };
    }

    return {
      success: true,
      data: {
        subjects: parsed.subjects ?? [],
        timetable: parsed.timetable ?? {},
        exportedAt: parsed.exportedAt,
      },
    };
  } catch (e) {
    console.error('importData error:', e);
    return { success: false, error: e.message };
  }
};
