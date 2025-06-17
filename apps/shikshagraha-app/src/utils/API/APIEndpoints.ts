import ForgotPassword from '../../app/forgetpassword/page';

const baseurl = process.env.NEXT_PUBLIC_BASE_URL;
console.log('Base URL:', baseurl,"process.env.NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);
export const API_ENDPOINTS = {
  contentRead: (doId: string) =>
    `${baseurl}/api/content/v1/read/${doId}?fields=artifactUrl`,
  academicYearsList: `${baseurl}/academicyears/list`,
  accountCreate: `${baseurl}/account/create`,
  userUpdate: (userId: string) => `${baseurl}/user/update/${userId}`,
  myCohorts: (userId: string | string[]) =>
    `${baseurl}/cohort/mycohorts/${userId}`,
  authRefresh: `${baseurl}/account/auth/refresh`,
  authLogout: `${baseurl}/account/auth/logout`,
  userAuth: `${baseurl}/user/auth`,

  accountLogin: `${baseurl}/user/v1/account/login`,
  sendOtp: `${baseurl}/user/v1/account/registrationOtp`,
  userProfileRead: `${baseurl}/user/v1/user/read`,
  resetPassword: `${baseurl}/user/v1/account/changePassword`,
  formRead: `${baseurl}/user/v1/form/read`,
  ForgotPassword: `${baseurl}/user/v1/account/resetPassword`,
  sendForgetOtp: `${baseurl}/user/v1/account/generateOtp`,
  deleteAccount:`${baseurl}/user/v1/account/delete`,
  roleRead: `${baseurl}/entity-management/v1/entities/entityListBasedOnEntityType?entityType=professional_role`,
  userCreate: `${baseurl}/interface/v1/account/create`,
  checkUser: (email: string) =>
    `${baseurl}/user/v1/public/checkUsername?username=${email}`,
  udiseSearch: (udise: string) =>
    `${baseurl}/entity-management/v1/entities/details/${udise}`,
  fieldOptionsRead: `${baseurl}/fields/options/read`,
  cohortSearch: `${baseurl}/cohort/search`,
  fieldOptionDelete: (type: string, option: string) =>
    `${baseurl}/fields/options/delete/${type}?option=${option}`,
  fieldUpdate: (fieldId: string) => `${baseurl}/fields/update/${fieldId}`,
  cohortUpdate: (cohortId: string) => `${baseurl}/cohort/update/${cohortId}`,
  notificationSend: `${baseurl}/notification/send`,
  tenantRead: `${baseurl}/tenant/read`,
  tenantCreate: `${baseurl}/tenant/create`,
  tenantUpdate: (tenantId: string) => `${baseurl}/tenant/update/${tenantId}`,
  tenantDelete: (tenantId: string) => `${baseurl}/tenant/delete/${tenantId}`,
  tenantSearch: `${baseurl}/tenant/search`,
  userList: `${baseurl}/user/list`,
  cohortMemberList: `${baseurl}/cohortmember/list`,
  userRead: (userId: string | string[], fieldValue: boolean) =>
    `${baseurl}/user/read/${userId}?fieldvalue=${fieldValue}`,
  suggestUsername: `${baseurl}/user/suggestUsername`,
  cohortUpdateUser: (userId?: string) => `${baseurl}/cohort/update/${userId}`,
  formReadWithContext: (context: string, contextType: string) =>
    `${baseurl}/form/read?context=${context}&contextType=${contextType}`,
  cohortCreate: `${baseurl}/cohort/create`,
  cohortMemberBulkCreate: `${baseurl}/cohortmember/bulkCreate`,
  cohortMemberUpdate: (membershipId: string | number) =>
    `${baseurl}/cohortmember/update/${membershipId}`,
  notificationTemplate: `${baseurl}/notification-templates`,
  courseStatus: `${baseurl}/tracking/user_certificate/user_course_status`,
  courseWiseLernerList: `${baseurl}/tracking/user_certificate/status/search`,
  getCourseName: `${baseurl}/action/composite/v3/search`,
  issueCertificate: `${baseurl}/tracking/certificate/issue`,
  renderCertificate: `${baseurl}/tracking/certificate/render`,
  downloadCertificate: `${baseurl}/tracking/certificate/render-PDF`,
};

export const COURSE_PLANNER_UPLOAD_ENDPOINTS = `${process.env.NEXT_PUBLIC_BASE_URL}/prathamservice/v1/course-planner/upload`;

export const TARGET_SOLUTION_ENDPOINTS = `${process.env.NEXT_PUBLIC_COURSE_PLANNER_API_URL}/solutions/targetedSolutions?type=improvementProject&currentScopeOnly=true`;
