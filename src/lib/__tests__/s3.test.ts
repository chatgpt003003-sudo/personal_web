/**
 * @jest-environment node
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { uploadFileToS3, deleteFileFromS3, getPresignedUploadUrl } from '../s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockSend = jest.fn();
const MockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;

describe('S3 utilities', () => {
  let mockConsoleError: jest.SpyInstance;

  beforeAll(() => {
    mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    MockS3Client.mockImplementation(
      () =>
        ({
          send: mockSend,
        }) as any
    );

    // Set up environment variables
    process.env.AWS_REGION = 'us-west-2';
    process.env.AWS_ACCESS_KEY_ID = 'test-access-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
  });

  describe('uploadFileToS3', () => {
    it('uploads file successfully and returns URL', async () => {
      mockSend.mockResolvedValueOnce({});

      const buffer = Buffer.from('test file content');
      const fileName = 'test.jpg';
      const contentType = 'image/jpeg';

      const result = await uploadFileToS3(buffer, fileName, contentType);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            Body: buffer,
            ContentType: contentType,
            ContentDisposition: 'inline',
            Key: expect.stringMatching(/^uploads\/\d+-test\.jpg$/),
          }),
        })
      );
      expect(result).toMatch(
        /^https:\/\/test-bucket\.s3\.amazonaws\.com\/uploads\/\d+-test\.jpg$/
      );
    });

    it('throws error when S3 upload fails', async () => {
      const error = new Error('S3 upload failed');
      mockSend.mockRejectedValueOnce(error);

      const buffer = Buffer.from('test file content');
      const fileName = 'test.jpg';
      const contentType = 'image/jpeg';

      await expect(
        uploadFileToS3(buffer, fileName, contentType)
      ).rejects.toThrow('Failed to upload file to S3');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error uploading to S3:',
        error
      );
    });

    it('generates unique keys for files with same name', async () => {
      mockSend.mockResolvedValue({});

      const buffer = Buffer.from('test file content');
      const fileName = 'test.jpg';
      const contentType = 'image/jpeg';

      // Mock Date.now to return different values
      const originalDateNow = Date.now;
      Date.now = jest
        .fn()
        .mockReturnValueOnce(1000000)
        .mockReturnValueOnce(2000000);

      const result1 = await uploadFileToS3(buffer, fileName, contentType);
      const result2 = await uploadFileToS3(buffer, fileName, contentType);

      expect(result1).toContain('uploads/1000000-test.jpg');
      expect(result2).toContain('uploads/2000000-test.jpg');
      expect(result1).not.toEqual(result2);

      Date.now = originalDateNow;
    });
  });

  describe('deleteFileFromS3', () => {
    it('deletes file successfully and returns true', async () => {
      mockSend.mockResolvedValueOnce({});

      const fileUrl =
        'https://test-bucket.s3.amazonaws.com/uploads/123-test.jpg';
      const result = await deleteFileFromS3(fileUrl);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            Key: 'uploads/123-test.jpg',
          }),
        })
      );
      expect(result).toBe(true);
    });

    it('returns false when deletion fails', async () => {
      const error = new Error('S3 delete failed');
      mockSend.mockRejectedValueOnce(error);

      const fileUrl =
        'https://test-bucket.s3.amazonaws.com/uploads/123-test.jpg';
      const result = await deleteFileFromS3(fileUrl);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error deleting from S3:',
        error
      );
    });

    it('handles invalid URLs gracefully', async () => {
      const invalidUrl = 'not-a-valid-url';
      const result = await deleteFileFromS3(invalidUrl);

      expect(result).toBe(false);
      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('extracts correct key from S3 URL', async () => {
      mockSend.mockResolvedValueOnce({});

      const fileUrl =
        'https://test-bucket.s3.amazonaws.com/uploads/nested/folder/file.png';
      await deleteFileFromS3(fileUrl);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Key: 'uploads/nested/folder/file.png',
          }),
        })
      );
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('generates presigned URL successfully', async () => {
      const mockSignedUrl =
        'https://test-bucket.s3.amazonaws.com/uploads/123-test.jpg?signature=xyz';
      mockGetSignedUrl.mockResolvedValueOnce(mockSignedUrl);

      const fileName = 'test.jpg';
      const contentType = 'image/jpeg';

      const result = await getPresignedUploadUrl(fileName, contentType);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object), // S3Client instance
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            ContentType: contentType,
            Key: expect.stringMatching(/^uploads\/\d+-test\.jpg$/),
          }),
        }),
        { expiresIn: 3600 }
      );

      expect(result).toEqual({
        uploadUrl: mockSignedUrl,
        fileUrl: expect.stringMatching(
          /^https:\/\/test-bucket\.s3\.amazonaws\.com\/uploads\/\d+-test\.jpg$/
        ),
      });
    });

    it('throws error when presigned URL generation fails', async () => {
      const error = new Error('Presigned URL generation failed');
      mockGetSignedUrl.mockRejectedValueOnce(error);

      const fileName = 'test.jpg';
      const contentType = 'image/jpeg';

      await expect(
        getPresignedUploadUrl(fileName, contentType)
      ).rejects.toThrow('Failed to generate upload URL');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error generating presigned URL:',
        error
      );
    });

    it('uses default values for missing environment variables', () => {
      delete process.env.AWS_REGION;
      delete process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_SECRET_ACCESS_KEY;
      delete process.env.AWS_S3_BUCKET_NAME;

      // Re-import to get new S3 client with defaults
      jest.resetModules();
      require('../s3');

      expect(MockS3Client).toHaveBeenCalledWith({
        region: 'us-east-1',
        credentials: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      });
    });
  });
});
