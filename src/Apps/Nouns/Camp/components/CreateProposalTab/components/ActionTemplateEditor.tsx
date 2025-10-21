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
import { ActionTemplateState } from '@/app/lib/Persistence/proposalDrafts';
import { useActionTemplate } from '@/src/Apps/Nouns/Camp/utils/hooks/useActionTemplate';
import { GroupedSelect } from '@/src/OS/components/UI';
import type { SelectOptionGroup } from '@/src/OS/components/UI';
import { TreasuryTransferTemplate } from './templates/TreasuryTransferTemplate';
import { NounTransferTemplate } from './templates/NounTransferTemplate';
import { NounSwapTemplate } from './templates/NounSwapTemplate';
import { AdminFunctionTemplate } from './templates/AdminFunctionTemplate';
import { PaymentStreamTemplate } from './templates/PaymentStreamTemplate';
import { SmartActionEditor } from './SmartActionEditor';
import styles from './ActionTemplateEditor.module.css';

interface ActionTemplateEditorProps {
  index: number;
  templateState: ActionTemplateState; // NEW: full template state
  onUpdateTemplateState: (state: ActionTemplateState) => void; // NEW
  disabled?: boolean;
}

export function ActionTemplateEditor({
  index,
  templateState,
  onUpdateTemplateState,
  disabled = false,
}: ActionTemplateEditorProps) {
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

  // Track if we've initialized from template state
  const initializedRef = React.useRef(false);
  
  // Initialize from saved template state on mount
  React.useEffect(() => {
    if (!initializedRef.current && templateState.templateId) {
      console.log('[ActionTemplateEditor] Initializing from saved state:', templateState.templateId);
      setSelectedTemplate(templateState.templateId);
      
      // Restore field values
      Object.entries(templateState.fieldValues).forEach(([field, value]) => {
        if (value) {
          updateField(field, value);
        }
      });
      
      initializedRef.current = true;
    }
  }, []);
  
  // Update parent template state when fields or actions change
  React.useEffect(() => {
    if (!initializedRef.current) return; // Skip during initialization
    
    console.log('[ActionTemplateEditor] Updating template state:', {
      templateId: selectedTemplate?.id || 'custom',
      fieldCount: Object.keys(fieldValues).length,
      actionCount: generatedActions.length
    });
    
    onUpdateTemplateState({
      templateId: selectedTemplate?.id || 'custom',
      fieldValues: fieldValues,
      generatedActions: generatedActions
    });
  }, [fieldValues, generatedActions, selectedTemplate]);

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
      // For custom templates, use the first generated action (or empty defaults)
      const customAction = templateState.generatedActions[0] || { target: '', value: '0', signature: '', calldata: '0x' };
      
      return (
        <SmartActionEditor
          index={index}
          target={customAction.target}
          value={customAction.value}
          signature={customAction.signature}
          calldata={customAction.calldata}
          onUpdate={(field, value) => {
            // Update the template state's generated action
            const updatedAction = { ...customAction, [field]: value };
            onUpdateTemplateState({
              templateId: 'custom',
              fieldValues: {},
              generatedActions: [updatedAction]
            });
          }}
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

    // Payment stream
    if (selectedTemplate.id === 'payment-stream') {
      return (
        <PaymentStreamTemplate
          template={selectedTemplate}
          fieldValues={fieldValues}
          onUpdateField={updateField}
          validationErrors={validationErrors}
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

      {/* Show generated transaction details for templates */}
      {selectedTemplate && selectedTemplate.id !== 'custom' && generatedActions.length > 0 && (
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

