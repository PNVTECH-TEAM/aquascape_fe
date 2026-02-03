import { notification } from 'antd';

export const NotificationTypeEnum = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export type NotificationTypeEnum =
  (typeof NotificationTypeEnum)[keyof typeof NotificationTypeEnum];

export const openNotificationWithIcon = (
  type: NotificationTypeEnum,
  message: string,
) => {
  notification[type]({
    message,
  });
};
