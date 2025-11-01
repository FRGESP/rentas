import LoginForm from "@/components/login/loginForm"
import { roles, getSession } from "@/actions";


async function Loginpage() {
  const session = await getSession();
  if(session.isLoggedIn){
    await roles();
  }
  return (
    <div className="bg-gradient-to-r from-gray-300 via-white">
      <div className='flex flex-col items-center justify-center h-[calc(100vh-1.5rem)] '>
        <div className='w-44 h-auto mb-7'>
          <img src="/assets/login/logo.webp" alt="logo"  />
        </div>
          <LoginForm />
          <div className="grid grid-cols-5 gap-12 mt-16 justify-center">
            <div className="w-28">
              <img src="/assets/login/casa1.png" alt="" />
            </div>
            <div className="w-28">
              <img src="/assets/login/edificio1.png" alt="" />
            </div>
            <div className="w-28">
              <img src="/assets/login/casa2.png" alt="" />
            </div>
            <div className="w-28">
              <img src="/assets/login/edificio2.png" alt="" />
            </div>
            <div className="w-28">
              <img src="/assets/login/centro.png" alt="" />
            </div>
          </div>
      </div>
      <h3 className="text-center">Desarrollado por <a href="https://www.blackwaves.tech/" target="_blank" className="underline">Blackwaves</a></h3>
    </div>
  )
}

export default Loginpage