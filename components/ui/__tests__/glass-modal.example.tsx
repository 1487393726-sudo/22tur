/**
 * GlassModal Usage Examples
 * GlassModal使用示例
 * 
 * This file demonstrates various ways to use the GlassModal component.
 */

'use client';

import React, { useState } from 'react';
import {
  GlassModal,
  GlassModalHeader,
  GlassModalTitle,
  GlassModalBody,
  GlassModalFooter,
} from '../glass-modal';
import { Button } from '../button';

/**
 * Example 1: Basic Modal
 * 示例1：基础模态框
 */
export function BasicModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Basic Modal</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Basic Modal Example"
      >
        <h2 className="text-xl font-semibold mb-4">Basic Modal</h2>
        <p className="mb-4">This is a simple modal with glass effects.</p>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </GlassModal>
    </>
  );
}

/**
 * Example 2: Modal with Structured Content
 * 示例2：带结构化内容的模态框
 */
export function StructuredModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Structured Modal</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Structured Modal Example"
      >
        <GlassModalHeader>
          <GlassModalTitle>Confirm Action</GlassModalTitle>
        </GlassModalHeader>

        <GlassModalBody>
          <p>Are you sure you want to proceed with this action?</p>
          <p className="mt-2 text-sm text-foreground/70">
            This action cannot be undone.
          </p>
        </GlassModalBody>

        <GlassModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={() => setIsOpen(false)}>
            Confirm
          </Button>
        </GlassModalFooter>
      </GlassModal>
    </>
  );
}

/**
 * Example 3: Modal with Form
 * 示例3：带表单的模态框
 */
export function FormModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Form Modal</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Form Modal Example"
      >
        <GlassModalHeader>
          <GlassModalTitle>Contact Information</GlassModalTitle>
        </GlassModalHeader>

        <GlassModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md glass-light backdrop-blur-[10px] border border-white/10"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md glass-light backdrop-blur-[10px] border border-white/10"
                required
              />
            </div>
          </form>
        </GlassModalBody>

        <GlassModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="glass-primary" onClick={handleSubmit}>
            Submit
          </Button>
        </GlassModalFooter>
      </GlassModal>
    </>
  );
}

/**
 * Example 4: Modal with Custom Styling
 * 示例4：带自定义样式的模态框
 */
export function CustomStyledModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Custom Modal</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Custom Styled Modal"
        className="max-w-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"
        overlayClassName="bg-purple-900/30"
      >
        <GlassModalHeader>
          <GlassModalTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
            Custom Styled Modal
          </GlassModalTitle>
        </GlassModalHeader>

        <GlassModalBody>
          <p>This modal has custom styling with gradient backgrounds.</p>
        </GlassModalBody>

        <GlassModalFooter>
          <Button variant="glass-primary" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </GlassModalFooter>
      </GlassModal>
    </>
  );
}

/**
 * Example 5: Modal with No Overlay Close
 * 示例5：禁用点击遮罩关闭的模态框
 */
export function NoOverlayCloseModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal (No Overlay Close)</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeOnOverlayClick={false}
        closeOnEscape={false}
        ariaLabel="No Overlay Close Modal"
      >
        <GlassModalHeader>
          <GlassModalTitle>Important Notice</GlassModalTitle>
        </GlassModalHeader>

        <GlassModalBody>
          <p>This modal can only be closed by clicking the button below.</p>
          <p className="mt-2 text-sm text-foreground/70">
            Clicking outside or pressing Escape won't close it.
          </p>
        </GlassModalBody>

        <GlassModalFooter>
          <Button variant="glass-primary" onClick={() => setIsOpen(false)}>
            I Understand
          </Button>
        </GlassModalFooter>
      </GlassModal>
    </>
  );
}

/**
 * Example 6: Modal with Long Content
 * 示例6：带长内容的模态框
 */
export function LongContentModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Long Content Modal</Button>

      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel="Long Content Modal"
      >
        <GlassModalHeader>
          <GlassModalTitle>Terms and Conditions</GlassModalTitle>
        </GlassModalHeader>

        <GlassModalBody>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Section {i + 1}.
            </p>
          ))}
        </GlassModalBody>

        <GlassModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Decline
          </Button>
          <Button variant="glass-primary" onClick={() => setIsOpen(false)}>
            Accept
          </Button>
        </GlassModalFooter>
      </GlassModal>
    </>
  );
}
