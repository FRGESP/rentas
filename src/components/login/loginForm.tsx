"use client"
import { useState, useEffect } from "react"
import { login } from "@/actions"
import { useRouter } from "next/navigation"
import { AlertPro, AlertVariants } from "./alerts-login"


function LoginForm() {

  const [alert, setAlert] = useState({
    variant: "hidden" as AlertVariants,
    tittle: "",
    body: "",
    duration: 0
  })

  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (alert.variant !== "hidden") {
      setShowAlert(true)
    }
  }, [alert])

  const [user, setUser] = useState({
    user: "",
    password: ""
  })

  const router = useRouter()

  const handlechange = (e: any) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const response = await login(user)
    setShowAlert(false)
    if (response) {
      // Si el usuario es incorrecto o no existe
      if (response.RES == 0) {
        setAlert({
          variant: "danger",
          tittle: "El usuario no está registrado",
          body: "Verifique su usuario e intente de nuevo",
          duration: 5
        })
      }
      // Si la contraseña es incorrecta
      if (response.RES == 3) {
        setAlert({
          variant: "danger",
          tittle: "Contraseña incorrecta",
          body: "Verifique su contraseña e intente de nuevo",
          duration: 5
        })
      }
      // Si el usuario está inactivo
      if (response.RES == 1) {
        setAlert({
          variant: "info",
          tittle: "Cuenta inactiva o suspendida",
          body: "Póngase en contacto con un supervisor para más información",
          duration: 5
        })
      }
    }
  }

  return (
    <div className="w-full flex justify-center px-4">
      <form className='flex flex-col w-full sm:w-[80%] md:w-[60%] lg:w-[45%] xl:w-[28%] gap-3 sm:gap-4' onSubmit={handleSubmit}>
      {showAlert && (<AlertPro variant={alert.variant} tittle={alert.tittle} body={alert.body} duration={alert.duration} />)}
        <div className='flex flex-col gap-1.5 sm:gap-2'>
          <label htmlFor="user" className="font-semibold text-lg sm:text-xl md:text-2xl flex-grow text-left">Usuario</label>
          <input onChange={handlechange} pattern="[0-9]+" name="user" required className='border border-black rounded-xl w-full py-2.5 sm:py-3 px-3 text-base sm:text-lg md:text-xl' type="text" placeholder='Ingrese su número de usuario' autoFocus />
        </div>
        <div className='flex flex-col gap-1.5 sm:gap-2'>
          <label htmlFor="password" className="font-semibold text-lg sm:text-xl md:text-2xl flex-grow text-left">Contraseña</label>
          <input onChange={handlechange} name="password" required className='border border-black rounded-xl w-full py-2.5 sm:py-3 px-3 text-base sm:text-lg md:text-xl' type="password" placeholder='Ingrese su contraseña' />
        </div>
        <button className='py-2.5 sm:py-3 font-semibold text-base sm:text-lg md:text-xl text-white bg-acento hover:bg-acentohover hover:cursor-pointer rounded-3xl active:scale-95 transition-transform'>Ingresar</button>
      </form>
    </div>
  )
}

export default LoginForm