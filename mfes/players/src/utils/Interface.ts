export interface ContentCreate {
  userId: string;
  contentId: string;
  courseId: string;
  unitId: string;
  contentType: string;
  contentMime: string;
  lastAccessOn: string;
  detailsObject: any[];
}

export enum ContentType {
  PDF = 'application/pdf',
  EPUB = 'application/epub',
  HTML = 'application/vnd.ekstep.html-archive',
  VIDEO_MP4 = 'video/mp4',
  QUESTION_SET = 'application/vnd.sunbird.questionset',
  H5P = 'application/vnd.ekstep.h5p-archive',
  YOUTUBE_VIDEO = 'video/youtube',
  YOUTUBE_X_VIDEO = 'video/x-youtube',
  WEBM_VIDEO = 'video/webm',
  COLLECTION = 'application/vnd.ekstep.content-collection',
}

export interface ContentCreate {
  userId: string;
  contentId: string;
  courseId: string;
  unitId: string;
  contentType: string;
  contentMime: string;
  lastAccessOn: string;
  detailsObject: any[];
}
