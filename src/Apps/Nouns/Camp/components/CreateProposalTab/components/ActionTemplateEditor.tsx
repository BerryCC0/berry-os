/**
 * ActionTemplateEditor Component
 * Main editor for creating proposal actions using templates
 */

'use client';

import React, { useState } from 'react';
import {
  ActionTemplateType,
  ACTION_TEMPLATES,
  getTemplatesByCategory,
  ProposalAction,
} from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import { useActionTemplate } from '@/src/Apps/Nouns/Camp/utils/hooks/useActionTemplate';
import { GroupedSelect } from '@/src/OS/components/UI';
import type { SelectOptionGroup } from '@/src/OS/components/UI';
import { TreasuryTransferTemplate } from './templates/TreasuryTransferTemplate';
import { NounTransferTemplate } from './templates/NounTransferTemplate';
import { NounSwapTemplate } from './templates/NounSwapTemplate';
import { AdminFunctionTemplate } from './templates/AdminFunctionTemplate';
import { SmartActionEditor } from './SmartActionEditor';
import styles from './ActionTemplateEditor.module.css';

interface ActionTemplateEditorProps {
  index: number;
  action: ProposalAction;
  onUpdate: (field: string, value: string) => void;
  onActionsGenerated?: (actions: ProposalAction[]) => void; // For multi-action templates
  disabled?: boolean;
}

export function ActionTemplateEditor({
  index,
  action,
  onUpdate,
  onActionsGenerated,
  disabled = false,
}: ActionTemplateEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const {
    selectedTemplate,
    fieldValues,
    generatedActions,
    validationErrors,
    isValid,
    setSelectedTemplate,
    updateField,
  } = useActionTemplate();

  // Track previous generated actions to prevent infinite loop
  const prevActionsRef = React.useRef<string>('');
  
  // Update parent action when generated actions change
  React.useEffect(() => {
    console.log('[ActionTemplateEditor] Effect triggered');
    
    // Serialize actions to compare with previous
    const actionsKey = JSON.stringify(generatedActions);
    
    // Only update if actions actually changed
    if (actionsKey === prevActionsRef.current) {
      console.log('[ActionTemplateEditor] Actions unchanged, skipping');
      return;
    }
    prevActionsRef.current = actionsKey;
    
    console.log('[ActionTemplateEditor] Actions changed:', {
      count: generatedActions.length,
      isMultiAction: selectedTemplate && typeof selectedTemplate !== 'string' && selectedTemplate.isMultiAction,
      template: selectedTemplate && typeof selectedTemplate !== 'string' ? selectedTemplate.id : selectedTemplate
    });
    
    // Check if this is a multi-action template
    const isMultiActionTemplate = selectedTemplate && typeof selectedTemplate !== 'string' && selectedTemplate.isMultiAction;
    
    if (isMultiActionTemplate && onActionsGenerated) {
      // Multi-action template - always use parent handler
      console.log('[ActionTemplateEditor] Calling onActionsGenerated with', generatedActions.length, 'actions');
      onActionsGenerated(generatedActions);
    } else if (generatedActions.length === 1) {
      // Single action template - update in place
      console.log('[ActionTemplateEditor] Updating single action in place');
      const generatedAction = generatedActions[0];
      onUpdate('target', generatedAction.target);
      onUpdate('value', generatedAction.value);
      onUpdate('signature', generatedAction.signature);
      onUpdate('calldata', generatedAction.calldata);
    } else if (generatedActions.length === 0) {
      console.log('[ActionTemplateEditor] No actions generated (incomplete form)');
    }
  }, [generatedActions, selectedTemplate, onUpdate, onActionsGenerated]);

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === '') {
      setSelectedTemplate(null);
      setSelectedCategory('');
      return;
    }

    if (templateId === 'custom') {
      setSelectedTemplate('custom');
      setSelectedCategory('custom');
      return;
    }

    setSelectedTemplate(templateId as ActionTemplateType);
    const template = ACTION_TEMPLATES[templateId as ActionTemplateType];
    if (template) {
      setSelectedCategory(template.category);
    }
  };

  // Group templates by category for dropdown
  const treasuryTemplates = getTemplatesByCategory('treasury');
  const swapTemplates = getTemplatesByCategory('swaps');
  const nounTemplates = getTemplatesByCategory('nouns');
  const paymentTemplates = getTemplatesByCategory('payments');
  const adminTemplates = getTemplatesByCategory('admin');

  // Build option groups for GroupedSelect
  const optionGroups: SelectOptionGroup[] = [
    {
      label: 'Treasury Transfers',
      options: treasuryTemplates.map(t => ({ value: t.id, label: t.name }))
    },
    {
      label: 'Streams',
      options: paymentTemplates.map(t => ({ value: t.id, label: t.name }))
    },
    {
      label: 'Token Buyer',
      options: swapTemplates.map(t => ({ value: t.id, label: t.name }))
    },
    {
      label: 'Nouns Token',
      options: nounTemplates.map(t => ({ value: t.id, label: t.name }))
    },
    {
      label: 'Custom',
      options: [{ value: 'custom', label: 'Custom Transaction' }]
    },
    {
      label: 'DAO Admin Functions',
      options: adminTemplates.map(t => ({ value: t.id, label: t.name }))
    }
  ];

  // Render template-specific form
  const renderTemplateForm = () => {
    if (!selectedTemplate) return null;

    if (selectedTemplate.id === 'custom') {
      return (
        <SmartActionEditor
          index={index}
          target={action.target}
          value={action.value}
          signature={action.signature}
          calldata={action.calldata}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      );
    }

    // Treasury transfers
    if (
      selectedTemplate.id === 'treasury-eth' ||
      selectedTemplate.id === 'treasury-usdc' ||
      selectedTemplate.id === 'treasury-weth' ||
      selectedTemplate.id === 'treasury-erc20-custom'
    ) {
      return (
        <TreasuryTransferTemplate
          template={selectedTemplate}
          fieldValues={fieldValues}
          onUpdateField={updateField}
          validationErrors={validationErrors}
          disabled={disabled}
        />
      );
    }

    // Noun transfer
    if (selectedTemplate.id === 'noun-transfer') {
      return (
        <NounTransferTemplate
          template={selectedTemplate}
          fieldValues={fieldValues}
          onUpdateField={updateField}
          validationErrors={validationErrors}
          disabled={disabled}
        />
      );
    }

    // Noun swap (multi-action)
    if (selectedTemplate.id === 'noun-swap') {
      return (
        <NounSwapTemplate
          template={selectedTemplate}
          fieldValues={fieldValues}
          onUpdateField={updateField}
          validationErrors={validationErrors}
          generatedActions={generatedActions}
          disabled={disabled}
        />
      );
    }

    // Admin functions
    if (selectedTemplate.category === 'admin') {
      return (
        <AdminFunctionTemplate
          template={selectedTemplate}
          fieldValues={fieldValues}
          onUpdateField={updateField}
          validationErrors={validationErrors}
          disabled={disabled}
        />
      );
    }

    // Default: Simple form renderer
    return (
      <div className={styles.simpleForm}>
        {selectedTemplate.fields.map(field => (
          <div key={field.name} className={styles.inputGroup}>
            <label className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}> *</span>}
            </label>
            <input
              type="text"
              className={styles.input}
              value={fieldValues[field.name] || ''}
              onChange={(e) => updateField(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={disabled}
            />
            {field.helpText && (
              <div className={styles.helpText}>{field.helpText}</div>
            )}
            {validationErrors.find(err => err.field === field.name) && (
              <div className={styles.error}>
                {validationErrors.find(err => err.field === field.name)?.message}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.actionLabel}>Action {index + 1}</span>
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={disabled}
        >
          {showAdvanced ? 'Simple' : 'Advanced'}
        </button>
      </div>

      {/* Template Selection Dropdown */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Action Type *</label>
        <GroupedSelect
          groups={optionGroups}
          value={selectedTemplate?.id || ''}
          onChange={handleTemplateSelect}
          placeholder="Select action type..."
          disabled={disabled}
        />

        {selectedTemplate && selectedTemplate.id !== 'custom' && (
          <div className={styles.templateDescription}>
            {selectedTemplate.description}
            {selectedTemplate.isMultiAction && (
              <span className={styles.multiActionBadge}>
                {' '}• Multi-action template{generatedActions.length > 0 ? ` (${generatedActions.length} actions)` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Template-specific form */}
      {renderTemplateForm()}

      {/* Advanced Mode: Show generated values */}
      {showAdvanced && selectedTemplate && selectedTemplate.id !== 'custom' && generatedActions.length > 0 && (
        <div className={styles.advancedSection}>
          <div className={styles.advancedHeader}>Generated Transaction Details</div>
          
          {generatedActions.map((genAction, idx) => (
            <div key={idx} className={styles.generatedAction}>
              {generatedActions.length > 1 && (
                <div className={styles.actionNumber}>Transaction {idx + 1}</div>
              )}
              
              <div className={styles.generatedField}>
                <label className={styles.generatedLabel}>Target Contract:</label>
                <input
                  type="text"
                  className={styles.generatedInput}
                  value={genAction.target}
                  readOnly
                />
              </div>

              <div className={styles.generatedField}>
                <label className={styles.generatedLabel}>ETH Value:</label>
                <input
                  type="text"
                  className={styles.generatedInput}
                  value={genAction.value}
                  readOnly
                />
              </div>

              <div className={styles.generatedField}>
                <label className={styles.generatedLabel}>Function Signature:</label>
                <input
                  type="text"
                  className={styles.generatedInput}
                  value={genAction.signature}
                  readOnly
                />
              </div>

              <div className={styles.generatedField}>
                <label className={styles.generatedLabel}>Calldata:</label>
                <textarea
                  className={styles.generatedTextarea}
                  value={genAction.calldata}
                  readOnly
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

