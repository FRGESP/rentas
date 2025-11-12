import LoginForm from "@/components/login/loginForm"
import { roles, getSession } from "@/actions";


async function Loginpage() {
  const session = await getSession();
  if(session.isLoggedIn){
    await roles();
  }
  return (
    <div className="bg-gradient-to-r from-gray-300 via-white min-h-screen">
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 py-6 sm:py-8'>
        <div className='w-32 sm:w-40 md:w-44 h-auto mb-6 sm:mb-7'>
          <img src="/assets/login/logo.webp" alt="logo"  />
        </div>
          <LoginForm />
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-8 md:gap-12 mt-8 sm:mt-12 md:mt-16 justify-center max-w-full px-2">
            <div className="w-16 sm:w-20 md:w-28">
              <img src="/assets/login/casa1.png" alt="Casa 1" />
            </div>
            <div className="w-16 sm:w-20 md:w-28">
              <img src="/assets/login/edificio1.png" alt="Edificio 1" />
            </div>
            <div className="w-16 sm:w-20 md:w-28">
              <img src="/assets/login/casa2.png" alt="Casa 2" />
            </div>
            <div className="w-16 sm:w-20 md:w-28 hidden sm:block">
              <img src="/assets/login/edificio2.png" alt="Edificio 2" />
            </div>
            <div className="w-16 sm:w-20 md:w-28 hidden sm:block">
              <img src="/assets/login/centro.png" alt="Centro" />
            </div>
          </div>
      </div>
      <h3 className="text-center text-xs sm:text-sm md:text-base pb-4">Desarrollado por <a href="https://www.blackwaves.tech/" target="_blank" className="underline">Blackwaves</a></h3>
    </div>
  )
}

export default Loginpage