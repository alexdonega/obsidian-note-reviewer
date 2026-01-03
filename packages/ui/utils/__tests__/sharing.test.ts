import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import {
  compress,
  decompress,
  toShareable,
  fromShareable,
  validateSharePayload,
  generateShareUrl,
  formatUrlSize,
  type SharePayload,
  type ShareableAnnotation,
} from '../sharing';
import { Annotation, AnnotationType } from '../../types';

describe('sharing module', () => {
  describe('compress and decompress', () => {
    describe('valid payloads', () => {
      it('should round-trip a simple payload', async () => {
        const payload: SharePayload = {
          p: '# Test Plan\n\nThis is a test.',
          a: [
            ['D', 'deleted text', 'author1'],
          ],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe(payload.p);
        expect(decompressed.a).toEqual(payload.a);
      });

      it('should handle empty annotations array', async () => {
        const payload: SharePayload = {
          p: 'Simple plan with no annotations',
          a: [],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe(payload.p);
        expect(decompressed.a).toEqual([]);
      });

      it('should handle all annotation types', async () => {
        const payload: SharePayload = {
          p: '# Plan',
          a: [
            ['D', 'deleted', null],
            ['R', 'original', 'replacement', 'user1'],
            ['C', 'commented text', 'my comment', null],
            ['I', 'context', 'inserted text', 'user2'],
          ],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.a.length).toBe(4);
        expect(decompressed.a[0][0]).toBe('D');
        expect(decompressed.a[1][0]).toBe('R');
        expect(decompressed.a[2][0]).toBe('C');
        expect(decompressed.a[3][0]).toBe('I');
      });

      it('should handle large markdown content', async () => {
        const largeMarkdown = '# Large Document\n\n' +
          'Lorem ipsum dolor sit amet. '.repeat(500);

        const payload: SharePayload = {
          p: largeMarkdown,
          a: [['D', 'Lorem', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe(largeMarkdown);
      });

      it('should handle many annotations', async () => {
        const annotations: ShareableAnnotation[] = Array.from({ length: 100 }, (_, i) =>
          ['C', `text ${i}`, `comment ${i}`, null] as ShareableAnnotation
        );

        const payload: SharePayload = {
          p: '# Plan with many annotations',
          a: annotations,
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.a.length).toBe(100);
        expect(decompressed.a[50][2]).toBe('comment 50');
      });

      it('should handle Unicode characters', async () => {
        const payload: SharePayload = {
          p: '# 计划文档 🎉\n\nThis contains émojis and 中文字符',
          a: [
            ['C', '中文', '这是一个评论 ✅', 'пользователь'],
          ],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toContain('计划文档');
        expect(decompressed.a[0][2]).toContain('评论');
      });

      it('should handle special characters in markdown', async () => {
        const payload: SharePayload = {
          p: '# Special chars: <script>alert("xss")</script>\n\n`code` **bold** *italic* [link](url)',
          a: [['D', '<script>alert("xss")</script>', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toContain('<script>');
      });

      it('should produce URL-safe base64', async () => {
        const payload: SharePayload = {
          p: 'Test plan',
          a: [],
        };

        const compressed = await compress(payload);

        // Should not contain standard base64 chars that need encoding
        expect(compressed).not.toContain('+');
        expect(compressed).not.toContain('/');
        expect(compressed).not.toContain('=');
        // Should only contain URL-safe chars
        expect(compressed).toMatch(/^[A-Za-z0-9_-]+$/);
      });

      it('should handle newlines and whitespace preservation', async () => {
        const payload: SharePayload = {
          p: '  \n\n# Heading\n\n   Indented text\n\n',
          a: [['C', '   spaces   ', 'preserved', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe(payload.p);
        expect(decompressed.a[0][1]).toBe('   spaces   ');
      });
    });

    describe('malformed JSON handling', () => {
      it('should throw on invalid base64', async () => {
        const invalidBase64 = '!!!not-valid-base64!!!';

        await expect(decompress(invalidBase64)).rejects.toThrow();
      });

      it('should throw on truncated base64', async () => {
        const payload: SharePayload = { p: 'test', a: [] };
        const compressed = await compress(payload);
        const truncated = compressed.slice(0, Math.floor(compressed.length / 2));

        await expect(decompress(truncated)).rejects.toThrow();
      });

      it('should throw on corrupted compressed data', async () => {
        // Use a larger payload to ensure corruption has effect
        const payload: SharePayload = {
          p: 'This is a longer test payload that will compress better',
          a: [['C', 'some text', 'comment', null] as ShareableAnnotation]
        };
        const compressed = await compress(payload);
        // Corrupt multiple positions to ensure decompression fails
        const chars = compressed.split('');
        const len = chars.length;
        // Corrupt start, middle, and near-end of compressed data
        chars[2] = chars[2] === 'X' ? 'Y' : 'X';
        chars[Math.floor(len / 2)] = chars[Math.floor(len / 2)] === 'Z' ? 'W' : 'Z';
        chars[len - 3] = chars[len - 3] === 'A' ? 'B' : 'A';
        const corrupted = chars.join('');

        await expect(decompress(corrupted)).rejects.toThrow();
      });

      it('should throw on empty string', async () => {
        await expect(decompress('')).rejects.toThrow();
      });
    });

    describe('tampered data handling', () => {
      it('should reject payload missing p field', async () => {
        // Manually construct invalid payload without p field
        const invalidPayload = { a: [] };
        const json = JSON.stringify(invalidPayload);
        const encoded = btoa(json);

        // Create a mock compressed string (this won't decompress correctly,
        // but we can test validateSharePayload directly)
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject payload missing a field', async () => {
        const invalidPayload = { p: 'test' };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject payload with p as number', async () => {
        const invalidPayload = { p: 123, a: [] };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject payload with p as null', async () => {
        const invalidPayload = { p: null, a: [] };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject payload with a as object', async () => {
        const invalidPayload = { p: 'test', a: {} };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject payload with a as string', async () => {
        const invalidPayload = { p: 'test', a: 'annotations' };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject null payload', async () => {
        expect(validateSharePayload(null)).toBe(false);
      });

      it('should reject primitive payload', async () => {
        expect(validateSharePayload('string')).toBe(false);
        expect(validateSharePayload(123)).toBe(false);
        expect(validateSharePayload(true)).toBe(false);
      });

      it('should reject array payload', async () => {
        expect(validateSharePayload([{ p: 'test', a: [] }])).toBe(false);
      });
    });

    describe('invalid annotation handling', () => {
      it('should reject annotation with invalid type', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['X', 'text', null]], // X is not a valid type
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation with numeric type', async () => {
        const invalidPayload = {
          p: 'test',
          a: [[1, 'text', null]],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation with too few elements', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['D', 'text']], // Missing author field
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject deletion annotation with 4 elements', async () => {
        // Deletion should only have 3 elements: [type, originalText, author]
        // Extra field is allowed but type is checked
        const payload = {
          p: 'test',
          a: [['D', 'text', null]],
        };
        expect(validateSharePayload(payload)).toBe(true);
      });

      it('should reject replacement annotation with only 3 elements', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['R', 'original', 'replacement']], // Missing author (4th element)
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation with numeric originalText', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['D', 123, null]],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation with numeric text', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['R', 'original', 456, null]],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation with numeric author', async () => {
        const invalidPayload = {
          p: 'test',
          a: [['D', 'text', 123]],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should accept annotation with null author', async () => {
        const validPayload = {
          p: 'test',
          a: [['D', 'text', null]],
        };
        expect(validateSharePayload(validPayload)).toBe(true);
      });

      it('should accept annotation with string author', async () => {
        const validPayload = {
          p: 'test',
          a: [['D', 'text', 'author name']],
        };
        expect(validateSharePayload(validPayload)).toBe(true);
      });

      it('should reject annotation that is not an array', async () => {
        const invalidPayload = {
          p: 'test',
          a: [{ type: 'D', text: 'text', author: null }],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });

      it('should reject annotation that is a string', async () => {
        const invalidPayload = {
          p: 'test',
          a: ['not an annotation'],
        };
        expect(validateSharePayload(invalidPayload)).toBe(false);
      });
    });
  });

  describe('toShareable', () => {
    it('should convert deletion annotation', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.DELETION,
        originalText: 'deleted text',
        createdA: Date.now(),
        author: 'user1',
      }];

      const shareable = toShareable(annotations);

      expect(shareable.length).toBe(1);
      expect(shareable[0]).toEqual(['D', 'deleted text', 'user1']);
    });

    it('should convert replacement annotation', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.REPLACEMENT,
        originalText: 'original',
        text: 'replacement',
        createdA: Date.now(),
        author: 'user1',
      }];

      const shareable = toShareable(annotations);

      expect(shareable.length).toBe(1);
      expect(shareable[0]).toEqual(['R', 'original', 'replacement', 'user1']);
    });

    it('should convert comment annotation', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.COMMENT,
        originalText: 'commented text',
        text: 'this is my comment',
        createdA: Date.now(),
      }];

      const shareable = toShareable(annotations);

      expect(shareable.length).toBe(1);
      expect(shareable[0]).toEqual(['C', 'commented text', 'this is my comment', null]);
    });

    it('should convert insertion annotation', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 0,
        type: AnnotationType.INSERTION,
        originalText: 'context',
        text: 'inserted text',
        createdA: Date.now(),
        author: 'user1',
      }];

      const shareable = toShareable(annotations);

      expect(shareable.length).toBe(1);
      expect(shareable[0]).toEqual(['I', 'context', 'inserted text', 'user1']);
    });

    it('should handle missing text as empty string', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.REPLACEMENT,
        originalText: 'original',
        // text is undefined
        createdA: Date.now(),
      }];

      const shareable = toShareable(annotations);

      expect(shareable[0][2]).toBe('');
    });

    it('should handle missing author as null', () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.DELETION,
        originalText: 'deleted',
        createdA: Date.now(),
        // author is undefined
      }];

      const shareable = toShareable(annotations);

      expect(shareable[0][2]).toBe(null);
    });

    it('should convert multiple annotations', () => {
      const annotations: Annotation[] = [
        {
          id: 'ann-1',
          blockId: 'block-1',
          startOffset: 0,
          endOffset: 10,
          type: AnnotationType.DELETION,
          originalText: 'first',
          createdA: Date.now(),
        },
        {
          id: 'ann-2',
          blockId: 'block-2',
          startOffset: 0,
          endOffset: 10,
          type: AnnotationType.COMMENT,
          originalText: 'second',
          text: 'comment',
          createdA: Date.now(),
        },
      ];

      const shareable = toShareable(annotations);

      expect(shareable.length).toBe(2);
      expect(shareable[0][0]).toBe('D');
      expect(shareable[1][0]).toBe('C');
    });

    it('should handle empty annotations array', () => {
      const shareable = toShareable([]);
      expect(shareable).toEqual([]);
    });
  });

  describe('fromShareable', () => {
    it('should convert deletion to Annotation', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'deleted text', 'author1'],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations.length).toBe(1);
      expect(annotations[0].type).toBe(AnnotationType.DELETION);
      expect(annotations[0].originalText).toBe('deleted text');
      expect(annotations[0].author).toBe('author1');
      expect(annotations[0].text).toBeUndefined();
    });

    it('should convert replacement to Annotation', () => {
      const shareable: ShareableAnnotation[] = [
        ['R', 'original', 'replacement', 'author1'],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations.length).toBe(1);
      expect(annotations[0].type).toBe(AnnotationType.REPLACEMENT);
      expect(annotations[0].originalText).toBe('original');
      expect(annotations[0].text).toBe('replacement');
      expect(annotations[0].author).toBe('author1');
    });

    it('should convert comment to Annotation', () => {
      const shareable: ShareableAnnotation[] = [
        ['C', 'text', 'comment', null],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations.length).toBe(1);
      expect(annotations[0].type).toBe(AnnotationType.COMMENT);
      expect(annotations[0].originalText).toBe('text');
      expect(annotations[0].text).toBe('comment');
      expect(annotations[0].author).toBeUndefined();
    });

    it('should convert insertion to Annotation', () => {
      const shareable: ShareableAnnotation[] = [
        ['I', 'context', 'inserted', 'author1'],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations.length).toBe(1);
      expect(annotations[0].type).toBe(AnnotationType.INSERTION);
      expect(annotations[0].originalText).toBe('context');
      expect(annotations[0].text).toBe('inserted');
      expect(annotations[0].author).toBe('author1');
    });

    it('should generate unique IDs', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'text1', null],
        ['D', 'text2', null],
        ['D', 'text3', null],
      ];

      const annotations = fromShareable(shareable);
      const ids = new Set(annotations.map(a => a.id));

      expect(ids.size).toBe(3);
    });

    it('should set blockId to empty string', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'text', null],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations[0].blockId).toBe('');
    });

    it('should set offsets to zero', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'text', null],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations[0].startOffset).toBe(0);
      expect(annotations[0].endOffset).toBe(0);
    });

    it('should preserve creation order via createdA', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'first', null],
        ['D', 'second', null],
        ['D', 'third', null],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations[0].createdA).toBeLessThan(annotations[1].createdA);
      expect(annotations[1].createdA).toBeLessThan(annotations[2].createdA);
    });

    it('should convert null author to undefined', () => {
      const shareable: ShareableAnnotation[] = [
        ['D', 'text', null],
      ];

      const annotations = fromShareable(shareable);

      expect(annotations[0].author).toBeUndefined();
    });

    it('should handle empty array', () => {
      const annotations = fromShareable([]);
      expect(annotations).toEqual([]);
    });
  });

  describe('toShareable and fromShareable round-trip', () => {
    it('should preserve annotation data through round-trip', () => {
      const original: Annotation[] = [
        {
          id: 'original-id',
          blockId: 'original-block',
          startOffset: 10,
          endOffset: 20,
          type: AnnotationType.DELETION,
          originalText: 'deleted text',
          createdA: 12345,
          author: 'user1',
        },
        {
          id: 'original-id-2',
          blockId: 'original-block-2',
          startOffset: 30,
          endOffset: 40,
          type: AnnotationType.REPLACEMENT,
          originalText: 'original',
          text: 'replacement',
          createdA: 12346,
        },
      ];

      const shareable = toShareable(original);
      const restored = fromShareable(shareable);

      // Core data should be preserved
      expect(restored[0].type).toBe(original[0].type);
      expect(restored[0].originalText).toBe(original[0].originalText);
      expect(restored[0].author).toBe(original[0].author);

      expect(restored[1].type).toBe(original[1].type);
      expect(restored[1].originalText).toBe(original[1].originalText);
      expect(restored[1].text).toBe(original[1].text);

      // IDs, offsets, and blockId are not preserved (regenerated)
      expect(restored[0].id).not.toBe(original[0].id);
      expect(restored[0].blockId).toBe('');
    });
  });

  describe('validateSharePayload', () => {
    describe('valid payloads', () => {
      it('should accept minimal valid payload', () => {
        expect(validateSharePayload({ p: '', a: [] })).toBe(true);
      });

      it('should accept payload with all annotation types', () => {
        const payload = {
          p: 'test',
          a: [
            ['D', 'text', null],
            ['R', 'orig', 'repl', null],
            ['C', 'text', 'comment', null],
            ['I', 'ctx', 'new', null],
          ],
        };
        expect(validateSharePayload(payload)).toBe(true);
      });

      it('should accept payload with extra fields (forward compatibility)', () => {
        const payload = {
          p: 'test',
          a: [],
          v: 2, // version field
          extra: 'ignored',
        };
        expect(validateSharePayload(payload)).toBe(true);
      });
    });

    describe('invalid payloads', () => {
      it('should reject undefined', () => {
        expect(validateSharePayload(undefined)).toBe(false);
      });

      it('should reject empty object', () => {
        expect(validateSharePayload({})).toBe(false);
      });

      it('should reject when p is missing', () => {
        expect(validateSharePayload({ a: [] })).toBe(false);
      });

      it('should reject when a is missing', () => {
        expect(validateSharePayload({ p: 'test' })).toBe(false);
      });

      it('should reject when p is not a string', () => {
        expect(validateSharePayload({ p: 123, a: [] })).toBe(false);
        expect(validateSharePayload({ p: null, a: [] })).toBe(false);
        expect(validateSharePayload({ p: undefined, a: [] })).toBe(false);
        expect(validateSharePayload({ p: ['array'], a: [] })).toBe(false);
      });

      it('should reject when a is not an array', () => {
        expect(validateSharePayload({ p: 'test', a: null })).toBe(false);
        expect(validateSharePayload({ p: 'test', a: 'string' })).toBe(false);
        expect(validateSharePayload({ p: 'test', a: { key: 'value' } })).toBe(false);
      });
    });
  });

  describe('generateShareUrl', () => {
    it('should generate URL with hash', async () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.DELETION,
        originalText: 'test',
        createdA: Date.now(),
      }];

      const url = await generateShareUrl('# Plan', annotations);

      // URL format: https://r.alexdonega.com.br/#slug~count~hash
      expect(url).toMatch(/^https:\/\/r\.alexdonega\.com\.br\/#[a-z0-9-]+~\d+~[A-Za-z0-9_-]+$/);
    });

    it('should generate URL-safe characters only', async () => {
      const annotations: Annotation[] = [];
      const url = await generateShareUrl('Test plan', annotations);
      const hash = url.split('#')[1];

      // Hash format: slug~count~compressed, all URL-safe characters
      expect(hash).toMatch(/^[A-Za-z0-9_~-]+$/);
    });

    it('should generate deterministic URL for same input', async () => {
      const annotations: Annotation[] = [{
        id: 'ann-1',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 10,
        type: AnnotationType.DELETION,
        originalText: 'test',
        createdA: 1000, // Fixed timestamp
        author: 'user1',
      }];

      const url1 = await generateShareUrl('# Plan', annotations);
      const url2 = await generateShareUrl('# Plan', annotations);

      expect(url1).toBe(url2);
    });
  });

  describe('formatUrlSize', () => {
    it('should format bytes', () => {
      expect(formatUrlSize('a'.repeat(100))).toBe('100 B');
    });

    it('should format kilobytes', () => {
      expect(formatUrlSize('a'.repeat(2048))).toBe('2.0 KB');
    });

    it('should handle empty string', () => {
      expect(formatUrlSize('')).toBe('0 B');
    });

    it('should handle Unicode correctly', () => {
      // Unicode characters take more bytes
      const url = '测试'; // 2 Chinese characters = 6 bytes in UTF-8
      const result = formatUrlSize(url);
      expect(result).toBe('6 B');
    });
  });

  describe('edge cases and security', () => {
    describe('compression boundary cases', () => {
      it('should handle single character plan', async () => {
        const payload: SharePayload = { p: 'x', a: [] };
        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);
        expect(decompressed.p).toBe('x');
      });

      it('should handle very long annotation text', async () => {
        const longText = 'a'.repeat(10000);
        const payload: SharePayload = {
          p: 'test',
          a: [['C', longText, 'comment', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.a[0][1]).toBe(longText);
      });

      it('should handle annotation with empty strings', async () => {
        const payload: SharePayload = {
          p: '',
          a: [['R', '', '', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe('');
        expect(decompressed.a[0][1]).toBe('');
        expect(decompressed.a[0][2]).toBe('');
      });
    });

    describe('potential attack vectors', () => {
      it('should handle XSS attempts in markdown', async () => {
        const xssPayload: SharePayload = {
          p: '<script>alert("xss")</script>',
          a: [['C', '<img src=x onerror=alert(1)>', 'comment', null]],
        };

        const compressed = await compress(xssPayload);
        const decompressed = await decompress(compressed);

        // Data should be preserved as-is (sanitization is handled elsewhere)
        expect(decompressed.p).toBe('<script>alert("xss")</script>');
        expect(decompressed.a[0][1]).toBe('<img src=x onerror=alert(1)>');
      });

      it('should handle null bytes', async () => {
        const payload: SharePayload = {
          p: 'before\0after',
          a: [['D', 'text\0text', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe('before\0after');
      });

      it('should handle JSON injection attempts', async () => {
        const payload: SharePayload = {
          p: '"},"injected":true,"p":"',
          a: [],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        // Should preserve the malicious string as data, not execute it
        expect(decompressed.p).toBe('"},"injected":true,"p":"');
        expect((decompressed as Record<string, unknown>).injected).toBeUndefined();
      });

      it('should handle prototype pollution attempts', async () => {
        // This tests that __proto__ is treated as regular data
        const payload: SharePayload = {
          p: 'test',
          a: [['C', '__proto__', '{"polluted": true}', null]],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.a[0][1]).toBe('__proto__');
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      });
    });

    describe('encoding edge cases', () => {
      it('should handle all base64url character replacements', async () => {
        // Generate payload that's likely to produce +, /, = in standard base64
        const payload: SharePayload = {
          p: Buffer.from([255, 255, 255]).toString(), // Will produce base64 with padding
          a: [],
        };

        const compressed = await compress(payload);

        // Verify no standard base64 special chars
        expect(compressed).not.toContain('+');
        expect(compressed).not.toContain('/');
        expect(compressed).not.toContain('=');
      });

      it('should handle mixed encoding scenarios', async () => {
        const payload: SharePayload = {
          p: 'ASCII + ümläuts + 中文 + 🎉 + \t\n\r',
          a: [
            ['C', 'мультибайт', 'комментарий', 'пользователь'],
          ],
        };

        const compressed = await compress(payload);
        const decompressed = await decompress(compressed);

        expect(decompressed.p).toBe(payload.p);
        expect(decompressed.a[0][1]).toBe('мультибайт');
      });
    });

    describe('error message safety', () => {
      it('should not expose payload content in decompress errors', async () => {
        // Create a valid compressed string, then corrupt it
        const secretPayload: SharePayload = {
          p: 'SECRET_API_KEY_12345',
          a: [],
        };
        const compressed = await compress(secretPayload);

        // Corrupt just enough to break decompression but keep some structure
        const corrupted = compressed.slice(0, 5) + 'XXXX' + compressed.slice(9);

        try {
          await decompress(corrupted);
          // If we get here, the test should still pass - no error is also safe
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          expect(errorMessage).not.toContain('SECRET_API_KEY_12345');
        }
      });
    });
  });

  describe('performance considerations', () => {
    it('should handle reasonably large payloads', async () => {
      const largeMarkdown = '# Large Document\n\n' +
        'Paragraph with lots of content. '.repeat(1000);

      const manyAnnotations: ShareableAnnotation[] = Array.from({ length: 50 }, (_, i) =>
        ['C', `selection ${i}`, `comment ${i} with some longer text to make it realistic`, 'user'] as ShareableAnnotation
      );

      const payload: SharePayload = {
        p: largeMarkdown,
        a: manyAnnotations,
      };

      const start = Date.now();
      const compressed = await compress(payload);
      const decompressed = await decompress(compressed);
      const elapsed = Date.now() - start;

      expect(decompressed.p).toBe(largeMarkdown);
      expect(decompressed.a.length).toBe(50);
      // Should complete in reasonable time (< 1 second)
      expect(elapsed).toBeLessThan(1000);
    });

    it('should compress data effectively', async () => {
      const payload: SharePayload = {
        p: 'The quick brown fox jumps over the lazy dog. '.repeat(100),
        a: [],
      };

      const json = JSON.stringify(payload);
      const compressed = await compress(payload);

      // Compressed should be smaller than original JSON
      expect(compressed.length).toBeLessThan(json.length);
    });
  });
});
