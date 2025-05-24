// composables/useNavigation.js
import { useRouter } from 'vue-router';

export const useNavigation = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const goHomePage = () => {
    router.push('/')
  }
;

  return {
    goBack,
    goHomePage
  };
};