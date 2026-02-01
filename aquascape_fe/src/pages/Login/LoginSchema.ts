

import { EMAIL_REGEX_PATTERN } from '@app/core/constants/regex';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';


export const useLoginSchema = () => {
  const { t } = useTranslation();


  return yup.object({
    email: yup
      .string()
      .required(
        t('LOGIN.REQUIREMENT.EMAIL', { field: t('LOGIN.REQUIREMENT.EMAIL') }) as string
      )
      .matches(
        EMAIL_REGEX_PATTERN,
        t('LOGIN.REQUIREMENT.PASSWORD', { field: t('LOGIN.REQUIREMENT.PASSWORD') }) as string
      ),


    password: yup
      .string()
      .required(
        t('LOGIN.REQUIREMENT.PASSWORD', { field: t('LOGIN.REQUIREMENT.PASSWORD') }) as string
      )
      .min(
        6,
        t('LOGIN.VALIDATION.MIN_LENGTH', {
          field: t('LOGIN.REQUIREMENT.PASSWORD'),
          length: 6,
        }) as string
      ),
  });
};



