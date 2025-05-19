/**
 * @fileoverview Component for handling product listing creation and data export functionality
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import { getUsedData } from "~data/usedData";
import { useLiveExportData } from "~/data/liveDataCollector";
// Import icons and animations for the buttons
import importIcon from "data-base64:../../../assets/importIcon.png";
import SuccessGif from "data-base64:../../../assets/greenTick.gif";
import { exportToGoogleSheet } from "~/services/googleSheetsService";
import { LogModule, logGroup, logTable, logGroupEnd, logError, logInfo, logWarning } from "~/data/utils/logger";
import { ExportField, ExportSettings } from '../../types/settings';
import { defaultExportFields } from "../../data/constants/exportFields";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const storage = new Storage();

// Array of button labels for the export options
const EXPORT_OPTIONS = [
  "Export (Based on settings)",
  "Export All"
];

// Animation duration in milliseconds
const SUCCESS_ANIMATION_DURATION = 2000;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props interface for the ListingExport component
interface ListingExportProps {
  areSectionsOpen: boolean;  // Controls whether all sections are expanded/collapsed
}

interface ExportStatus {
  isLoading: boolean;
  success: boolean;
  error: string | null;
  url: string | null;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const ListingExport: React.FC<ListingExportProps> = ({ areSectionsOpen }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Controls the expansion/collapse state of this section
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  
  // Tracks which buttons have been clicked for showing success animation
  const [isClicked, setIsClicked] = useState<boolean[]>([false, false]);
  
  // Export status state
  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    isLoading: false,
    success: false,
    error: null,
    url: null
  });

  // Live export data from real-time collector
  const liveData = useLiveExportData();

  // Effect to sync the section's open state with the global sections state
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Effect to handle successful export
  useEffect(() => {
    if (exportStatus.success && exportStatus.url) {
      window.open(exportStatus.url, "_blank");
    }
  }, [exportStatus.success, exportStatus.url]);

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  // Handles the click event for each export option button
  const handleButtonClick = (index: number) => {
    const newIsClicked = [...isClicked];
    newIsClicked[index] = true;
    setIsClicked(newIsClicked);

    setTimeout(() => {
      newIsClicked[index] = false;
      setIsClicked([...newIsClicked]);
    }, SUCCESS_ANIMATION_DURATION);
  };

  // Helper to validate and repair exportSettings
  function validateExportSettings(settings: any, defaultFields: ExportField[]): ExportSettings {
    if (!settings || !Array.isArray(settings.fields)) {
      logError(LogModule.GOOGLE_SHEETS, 'Malformed exportSettings, falling back to defaults.');
      return { fields: defaultFields };
    }
    const validFields = settings.fields.filter(f => f && typeof f.id === 'string' && typeof f.label === 'string' && typeof f.enabled === 'boolean' && typeof f.order === 'number');
    if (validFields.length === 0 || validFields.length !== defaultFields.length) {
      logError(LogModule.GOOGLE_SHEETS, 'Invalid number of export fields, using defaults.');
      return { fields: defaultFields };
    }
    return { fields: validFields };
  }

  // Handles export to Google Sheets
  const handleExportClick = async (label: string) => {
    try {
      setExportStatus({ isLoading: true, success: false, error: null, url: null });

      // Use live export data instead of stale usedData
      const productData = liveData;
      if (!productData) {
        throw new Error("No product data available to export");
      }

      // Log product data for debugging
      if (!window.__nsp_logged_export) {
        logGroup(LogModule.GOOGLE_SHEETS, "Product Data for Export");
        logTable(LogModule.GOOGLE_SHEETS, "Raw Data", productData);
        logGroupEnd();
        window.__nsp_logged_export = true;
      }

      const exportAll = label === "Export All";
      const allFields = Object.keys(productData).filter(key => {
        const value = productData[key];
        return value !== undefined && value !== null;
      });

      // Load exportSettings fields for metadata (category, order, label)
      let exportSettingsFields: ExportField[] = [];
      try {
        let settings = await storage.get('exportSettings') as ExportSettings;
        if (!settings) {
          const local = localStorage.getItem('exportSettings');
          if (local) settings = JSON.parse(local) as ExportSettings;
        }
        const validated = validateExportSettings(settings, defaultExportFields);
        exportSettingsFields = validated.fields;
        // Persist validated settings
        await storage.set('exportSettings', validated);
        localStorage.setItem('exportSettings', JSON.stringify(validated));
      } catch (e) {
        logError(LogModule.GOOGLE_SHEETS, 'Error loading exportSettings: ' + (e as Error).message);
        exportSettingsFields = defaultExportFields;
      }

      // Helper: get field meta from exportSettings.fields or fallback
      const getFieldMeta = (id: string) => {
        return (
          exportSettingsFields.find(f => f.id === id) ||
          { id, label: id, enabled: true, order: 999, category: 'General' }
        );
      };

      let fieldsToExport: string[] = [];
      if (exportAll) {
        // Export all fields in the order defined by defaultExportFields.order
        fieldsToExport = defaultExportFields
          .slice()
          .sort((a, b) => a.order - b.order)
          .map(f => f.id);
      } else {
        // Export only enabled fields, sorted by their order (as rearranged in UI)
        const enabledFields = exportSettingsFields.filter(f => f.enabled).sort((a, b) => a.order - b.order);
        fieldsToExport = enabledFields.map(f => f.id);
        if (fieldsToExport.length === 0) {
          setExportStatus({
            isLoading: false,
            success: false,
            error: 'Please enable at least one export field in settings.',
            url: null
          });
          logError(LogModule.GOOGLE_SHEETS, 'No fields are enabled for export.');
          return;
        }
      }

      // Build export rows with meta, in the correct order
      let exportRows = fieldsToExport.map(fieldId => {
        const meta = getFieldMeta(fieldId);
        let value = productData[fieldId];
        let formattedValue = "";
        if (value === undefined || value === null) {
          formattedValue = "";
        } else if (typeof value === "object") {
          formattedValue = JSON.stringify(value);
        } else if (typeof value === "number") {
          formattedValue = value.toString();
        } else if (typeof value === "boolean") {
          formattedValue = value ? "Yes" : "No";
        } else {
          formattedValue = String(value);
        }
        // Special handling for mainImage field: embed image using Google Sheets IMAGE formula if valid URL
        if (fieldId === "mainImage" && typeof formattedValue === "string" && /^https?:\/\//.test(formattedValue)) {
          formattedValue = `=IMAGE("${formattedValue}", 4, 75, 75)`;
        }
        return {
          category: meta.category || 'General',
          label: meta.label || fieldId,
          value: formattedValue,
          order: meta.order || 999,
          id: fieldId
        };
      });

      // No further sorting/grouping; rows are already in correct order

      // Add header row for three columns (multi-product ready)
      const productHeaders = ["Product 1"];
      const headers = ["Category", "Field", ...productHeaders];
      const data = [headers, ...exportRows.map(row => [row.category, row.label, row.value])];

      // Log the final payload before sending
      logGroup(LogModule.GOOGLE_SHEETS, "Export Payload");
      logTable(LogModule.GOOGLE_SHEETS, "Data", { rows: data.length });
      logGroupEnd();

      const result = await exportToGoogleSheet({
        data,
        logger: { logGroup, logTable, logGroupEnd, logError }
      });

      if (!result.success) {
        throw new Error(result.error || "Export failed");
      }

      setExportStatus({
        isLoading: false,
        success: true,
        error: null,
        url: result.url || null
      });

      handleButtonClick(EXPORT_OPTIONS.indexOf(label));
      logInfo(LogModule.GOOGLE_SHEETS, `Export completed successfully - ${fieldsToExport.length} fields exported to ${result.url}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Export failed. Please try again.";
      setExportStatus({
        isLoading: false,
        success: false,
        error: errorMessage,
        url: null
      });
      logError(LogModule.GOOGLE_SHEETS, `Export failed: ${errorMessage}`);
    }
  };

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  return (
    <div
      id="Listing & Export"
      className={`bg-[#d7d7d7] m-1 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-auto opacity-100" : "h-9"
      }`}
    >
      {/* Section Header */}
      <h1
        className="font-medium text-[12px] text-black text-start cursor-pointer w-full px-2 py-1 bg-cyan-500 flex items-center justify-between group hover:bg-cyan-600 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5">
          <img src={importIcon} alt="Export" className="w-4 h-4" />
          <span>Listing & Export</span>
        </div>
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </h1>

      {/* Content Section */}
      <div className={`p-2 space-y-2 ${isOpen ? "block" : "hidden"}`}>
        {/* Export Buttons */}
        <div className="flex flex-col gap-2">
          {EXPORT_OPTIONS.map((label, index) => (
            <button
              key={label}
              onClick={() => handleExportClick(label)}
              disabled={exportStatus.isLoading}
              className={`relative px-4 py-2 text-xs font-medium rounded transition-all duration-200
                ${isClicked[index] ? "bg-green-500 text-white" : "bg-white hover:bg-gray-50"}
                ${exportStatus.isLoading ? "opacity-50 cursor-not-allowed" : ""}
                border border-gray-300 shadow-sm`}
            >
              {isClicked[index] ? (
                <div className="flex items-center justify-center">
                  <img src={SuccessGif} alt="Success" className="w-4 h-4 mr-2" />
                  Success!
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {exportStatus.isLoading ? (
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : null}
                  {label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {exportStatus.error && (
          <div className="text-red-500 text-xs mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {exportStatus.error}
          </div>
        )}
      </div>
    </div>
  );
};

// Add window property declarations
declare global {
  interface Window {
    __nsp_logged_export?: boolean;
  }
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ListingExport;