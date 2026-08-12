import { RegionData, MefDepartment, PliegoEjecutor, NationalMeta } from '../types';
import realData from './realData.json';

export const LOGO_CENEPRED = "https://lh3.googleusercontent.com/aida-public/AB6AXuDVmjmpjymZJ7JDI7MSb12X3KHSUHwg4tvVHBLw8D5EBio7RAakaXl2sTKfwatTWyZ_t84mdN2mbixH91NAVKoVVGKvzl7bkxQBqAwcGi77pUZQ4gmoQV_C80RZYoWjydnS2F6eW7gb6qUGUuNupE5gdwLsro9w2-GYbYvX_M-b5QRHa3HtX09GxorFrGuUu_zziZm-G6jx5FczvkUbMfz9nTPtwe2vm7piPrkP59EfihE4Ia2W-T_Ang";
export const PROFILE_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuD8jz68D6Jdn2vrp2B1EXhtnnZetQZ-L18u9Z-kSluvQ4urv9dJ4x6m-21X1df2W8MLcQDAzH4Jy3v96OXlIVXUpDIuJMwoJD72UuQ9OXxgsvOR6zXTH-YuXlLDTKtulsA5__uk6ow2_PTbxPk-Z3EJ_G7rc4F-VyV0XxQ2T9yBuCmOhA7OtLcMZOJmqmCh-lTXg1cHt2wqAVvp60TxJbXeTXNzM7UjTPix1BrE_Ob8TCnjkolocvJnIA";

export const NATIONAL_META: NationalMeta = realData.meta;
export const PERU_DEPARTAMENTOS: Record<string, RegionData> = realData.departamentos as Record<string, RegionData>;
export const TABLAS_MEF_DEPARTAMENTO: MefDepartment[] = realData.tablaMef as MefDepartment[];
export const PLIEGOS_EJECUTORES: PliegoEjecutor[] = realData.pliegosEjecutores as PliegoEjecutor[];
export const MATRIZ_ESTACIONAL = realData.matrizEstacional;
