import { useEffect, useState } from 'react';
import Logo from '../../Images/logotip.png';
import Input from '../../Components/Inputs/Input';
import { clearError, signIn } from './loginSlice';
import { useDispatch, useSelector } from 'react-redux';
import { universalToast } from '../../Components/ToastMessages/ToastMessages';
import { reset } from '../Currency/currencySlice.js';
import { useTranslation } from 'react-i18next';
import './Login.scss';
import BGImage from '../../Images/bg-login.png';

function Login() {
  const { t } = useTranslation(['common']);
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.login);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');


  const handleChangeLogin = (e) => {
    const str = e.target.value;
    setLogin(str);
  };

  const handleChangePassword = (e) => {
    const str = e.target.value;
    setPassword(str);
  };

  const handleClickSubmit = (e) => {
    e.preventDefault();
    const data = {
      login,
      password,
    };
    dispatch(signIn(data));
  };

  useEffect(() => {
    if (error) {
      universalToast(error, 'error');
      setTimeout(() => {
        dispatch(clearError());
      }, 1000);
    }
    dispatch(reset());
  }, [error, dispatch]);

  return (
    <section className="w-full h-full flex items-center justify-center   ">
      <div className="w-full h-[100vh] login-container flex flex-wrap ">
        <div className="login-left hidden lg:flex  items-center justify-center w-full lg:w-1/2 bg-blue-500 ">
          <div className="text-center  text-white ">
            <img src={BGImage} alt="Digital" className=" " />
          </div>
        </div>
        <div className="login-right mt-[-50px] flex items-center justify-center w-full lg:w-1/2 bg-white">
          <div className="login-form-container w-full max-w-md p-4">
            <div className="logo-container  mb-8 text-center">
              <img src={Logo} className="w-24 mx-auto" alt="Logo" />
            </div>
            <form className="login-form space-y-6" onSubmit={handleClickSubmit}>
              <div>
                <Input
                  label={t('Login')}
                  type="text"
                  value={login}
                  placeholder="Loginni kiriting..."
                  onChange={handleChangeLogin}
                />
              </div>
              <div>
                <Input
                  label={t('Parol')}
                  type="password"
                  value={password}
                  placeholder="Parolni kiriting..."
                  password={true}
                  onChange={handleChangePassword}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-500 text-[white] rounded hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? <span className="animate-spin spinner mr-2"></span> : t('Kirish')}
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
