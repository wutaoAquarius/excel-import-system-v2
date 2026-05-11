'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface EditableCellProps {
  value: string | number;
  error?: string;
  onChange?: (value: string) => void;
  onMoveNext?: () => void;
  onMoveDown?: () => void;
}

export default function EditableCell({
  value,
  error,
  onChange,
  onMoveNext,
  onMoveDown,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setEditValue(String(value ?? ''));
  }, [value]);

  const handleSave = () => {
    setEditing(false);
    if (onChange && editValue !== String(value ?? '')) {
      onChange(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleSave();
      onMoveNext?.();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
      onMoveDown?.();
    } else if (e.key === 'Escape') {
      setEditValue(String(value ?? ''));
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        size="small"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          borderColor: error ? '#ff4d4f' : undefined,
        }}
      />
    );
  }

  const cellContent = (
    <div
      className="editable-cell"
      onClick={() => setEditing(true)}
      style={{
        background: error ? '#fff2f0' : undefined,
        border: error ? '1px solid #ffccc7' : '1px solid transparent',
        borderRadius: 4,
        padding: '4px 8px',
        minHeight: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
      }}
    >
      {error && (
        <ExclamationCircleOutlined
          style={{ color: '#ff4d4f', fontSize: 12, flexShrink: 0 }}
        />
      )}
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {String(value ?? '') || <span style={{ color: '#ccc' }}>点击编辑</span>}
      </span>
    </div>
  );

  if (error) {
    return (
      <Tooltip title={error} color="#ff4d4f">
        {cellContent}
      </Tooltip>
    );
  }

  return cellContent;
}
