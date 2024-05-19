import * as aws from 'aws-sdk';

import { Injectable } from '@nestjs/common';

interface IUploadPublicFile {
  bufferData: Buffer;
  fileName: string;
  folder: string;
  mimetype: string;
}

@Injectable()
export class FileUploadService {
  private awsS3: aws.S3;
  constructor() {
    this.awsS3 = new aws.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  /**
   * @description For uploading files to aws s3 bucket,
   *
   * @param param0
   *
   * @returns returnes url
   */

  async uploadPublicFile({
    bufferData,
    fileName,
    folder,
    mimetype,
  }: IUploadPublicFile): Promise<{ url: string }> {
    const name = `${folder}/${Date.now()}_${fileName}`;

    const data = await this.awsS3
      .upload({
        Body: bufferData,
        Bucket: 'entangles-public-files',
        ContentType: mimetype,
        Key: name,
        ACL: 'public-read',
      })
      .promise();

    return { url: data.Location };
  }
}
