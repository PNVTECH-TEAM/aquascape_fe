import { useSelector } from 'react-redux';
import type { RootState } from '../redux/rootReducer';


export const useUser = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return { user };
};
