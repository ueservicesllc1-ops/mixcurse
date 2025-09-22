// Backblaze B2 Storage Service
class StorageService {
  constructor() {
    this.bucketId = 'cc12bbd592366bde909b0a1a';
    this.keyId = '005c2b526be0baa000000000f';
    this.applicationKey = 'K0051CrlFQOcyjlNZyFVI3spGLFhxk4';
    this.endpoint = 's3.us-east-005.backblazeb2.com';
    this.baseUrl = `https://${this.endpoint}`;
    this.authToken = null;
    this.apiUrl = null;
  }

  // Get authorization token
  async getAuthToken() {
    try {
      const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(this.keyId + ':' + this.applicationKey)}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get auth token');
      }

      const data = await response.json();
      this.authToken = data.authorizationToken;
      this.apiUrl = data.apiUrl;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get upload URL
  async getUploadUrl() {
    try {
      if (!this.authToken) {
        const authResult = await this.getAuthToken();
        if (!authResult.success) return authResult;
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Upload file to B2
  async uploadFile(file, fileName = null) {
    try {
      const uploadUrlResult = await this.getUploadUrl();
      if (!uploadUrlResult.success) return uploadUrlResult;

      const { uploadUrl, authorizationToken } = uploadUrlResult.data;
      const finalFileName = fileName || `audio/${Date.now()}_${file.name}`;

      // Calculate SHA1 hash
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-1', fileBuffer);
      const sha1 = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': authorizationToken,
          'X-Bz-File-Name': finalFileName,
          'X-Bz-Content-Type': file.type,
          'X-Bz-Content-Sha1': sha1,
          'Content-Length': file.size.toString()
        },
        body: fileBuffer
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return { 
        success: true, 
        data: {
          ...data,
          downloadUrl: `${this.baseUrl}/file/${this.bucketId}/${finalFileName}`,
          fileName: finalFileName
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Download file from B2
  async downloadFile(fileName) {
    try {
      const downloadUrl = `${this.baseUrl}/file/${this.bucketId}/${fileName}`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      return { success: true, blob, url: downloadUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // List files in bucket
  async listFiles() {
    try {
      if (!this.authToken) {
        const authResult = await this.getAuthToken();
        if (!authResult.success) return authResult;
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketId,
          maxFileCount: 1000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const data = await response.json();
      return { success: true, files: data.files };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete file from B2
  async deleteFile(fileId, fileName) {
    try {
      if (!this.authToken) {
        const authResult = await this.getAuthToken();
        if (!authResult.success) return authResult;
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: fileId,
          fileName: fileName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get file info
  getFileUrl(fileName) {
    return `${this.baseUrl}/file/${this.bucketId}/${fileName}`;
  }
}

export default new StorageService();




