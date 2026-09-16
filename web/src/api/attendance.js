import { request } from './client.js';
// Attendance is currently read through the existing classbook resource.
export const attendance = { list: options => request('/modules/classbook', options) };
