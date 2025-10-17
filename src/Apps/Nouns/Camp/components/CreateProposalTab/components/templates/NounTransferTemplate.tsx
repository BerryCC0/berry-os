/**
 * NounTransferTemplate
 * Form for transferring a Noun from treasury
 */

'use client';

import React from 'react';
import { ActionTemplate, TemplateFieldValues } from '@/src/Apps/Nouns/Camp/utils/actionTemplates';
import styles from './TreasuryTransferTemplate.module.css'; // Reuse same styles

interface ValidationError {
  field: string;
  message: string;
}

interface NounTransferTemplateProps {
  template: ActionTemplate;
  fieldValues: TemplateFieldValues;
  onUpdateField: (fieldName: string, value: string) => void;
  validationErrors: ValidationError[];
  disabled?: boolean;
}

export function NounTransferTemplate({
  template,
  fieldValues,
  onUpdateField,
  validationErrors,
  disabled = false,
}: NounTransferTemplateProps) {
  return (
    <div className={styles.container}>
      {template.fields.map(field => (
        <div key={field.name} className={styles.inputGroup}>
          <label className={styles.label}>
            {field.label}
            {field.required && <span className={styles.required}> *</span>}
          </label>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className={styles.input}
            value={fieldValues[field.name] || ''}
            onChange={(e) => onUpdateField(field.name, e.target.value)}
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
}

