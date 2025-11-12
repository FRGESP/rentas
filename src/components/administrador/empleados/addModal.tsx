"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, X } from "lucide-react";
import axios from "axios";
import { addEmpleado } from "@/actions";
import { useRouter } from "next/navigation";
import { on } from "events";

interface AddModalProps {
  onGuardado: () => void;
}

function AddModal({ onGuardado }: AddModalProps) {
  const { toast } = useToast();
  const router = useRouter();

  //Controla el estado del modal
  const [isOpen, setIsOpen] = useState(false);

  //Controla el estado de los errores
  const [errors, setErrors] = useState<Record<string, string>>({});

  //Guarda la informacion del input
  const [inputValue, setInputValue] = useState({
    nombre: "",
    apellidoPat: "",
    apellidoMat: "",
    telefono: "",
    rol: "",
    estatus: "",
    password: ""
  });

  //Controla el cambio del input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
    console.log(inputValue);

    if (value.trim() === "") {
      setErrors((prev) => ({
        ...prev,
        [name]: "Este campo es obligatorio",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    console.log(errors);
  };

  //Funcion para abrir el modal
  const openModal = () => {
    setIsOpen(true);
    // Reiniciar los valores de los inputs y errores al abrir el modal
    setErrors({});
    setInputValue({
      nombre: "",
      apellidoPat: "",
      apellidoMat: "",
      telefono: "",
      rol: "",
      estatus: "",
      password: ""
    });
  };
  //Funcion para cerrar el modal
  const closeModal = () => {
    setIsOpen(false);
  };




  const handleSubmit = async () => {

    const newErrors: Record<string, string> = {};

    Object.entries(inputValue).forEach(([Key, value]) => {
      if (value.trim() === "") {
        newErrors[Key] = "Este campo es obligatorio"
      }
    })
    setErrors(newErrors);

    if (Object.keys(newErrors).length == 0) {
      const response = await addEmpleado(inputValue);
      console.log(response);
      if (response === 200) {
        setIsOpen(false);

        toast({
          title: "Empleado agregado",
          description: "El empleado ha sido agregado correctamente",
          variant: "success",
        });
        onGuardado();
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el empleado",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <button className=" ml-1 rounded-md p-2 hover:bg-gray-200" onClick={openModal}>
        <Plus
          className="text-acento stroke-[5]"
          size={45}

        />
      </button>

      {isOpen && (
        <div className="flex items-center justify-center">
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-in fade-in duration-200"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-navy to-blue-900 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Agregar Empleado</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body del modal con scroll */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {/* Campo Nombre */}
                <div className="space-y-2">
                  <label
                    htmlFor="nombre"
                    className="block font-semibold"
                  >
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["nombre"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-400"
                      }`}
                    autoFocus
                    name="nombre"
                    placeholder="Ej: Juan"
                    onChange={handleChange}
                  />
                  {errors["nombre"] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors["nombre"]}</span>
                    </p>
                  )}
                </div>

                {/* Campo Apellido Paterno */}
                <div className="space-y-2">
                  <label
                    htmlFor="apellidoPat"
                    className="block font-semibold"
                  >
                    Apellido Paterno
                  </label>
                  <input
                    type="text"
                    id="apellidoPat"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["apellidoPat"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-400"
                      }`}
                    name="apellidoPat"
                    placeholder="Ej: Pérez"
                    onChange={handleChange}
                  />
                  {errors["apellidoPat"] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors["apellidoPat"]}</span>
                    </p>
                  )}
                </div>

                {/* Campo Apellido Materno */}
                <div className="space-y-2">
                  <label
                    htmlFor="apellidoMat"
                    className="block font-semibold"
                  >
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    id="apellidoMat"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["apellidoMat"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-400"
                      }`}
                    name="apellidoMat"
                    placeholder="Ej: García"
                    onChange={handleChange}
                  />
                  {errors["apellidoMat"] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors["apellidoMat"]}</span>
                    </p>
                  )}
                </div>

                {/* Campo Teléfono */}
                <div className="space-y-2">
                  <label
                    htmlFor="telefono"
                    className="block font-semibold"
                  >
                    Teléfono
                  </label>
                  <input
                    type="number"
                    id="telefono"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["telefono"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-400"
                      }`}
                    name="telefono"
                    placeholder="Ej: 4771234567"
                    onChange={handleChange}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                  {errors["telefono"] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors["telefono"]}</span>
                    </p>
                  )}
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block font-semibold"
                  >
                    Contraseña
                  </label>
                  <input
                    type="text"
                    id="password"
                    className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none ${errors["password"]
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-400"
                      }`}
                    name="password"
                    placeholder="Ingrese la contraseña"
                    onChange={handleChange}
                  />
                  {errors["password"] && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠</span>
                      <span>{errors["password"]}</span>
                    </p>
                  )}
                </div>

                {/* Campos de Rol y Estatus en grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Campo Rol */}
                  <div className="space-y-2">
                    <label className="block font-semibold" htmlFor="rol">
                      Rol
                    </label>
                    <select
                      onChange={handleChange}
                      name="rol"
                      id="rol"
                      defaultValue={'Default'}
                      className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["rol"]
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-400"
                        }`}
                    >
                      <option value="Default" disabled hidden>Seleccione un Rol</option>
                      <option value="3">Administrador</option>
                      <option value="2">Cajero</option>
                    </select>
                    {errors["rol"] && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors["rol"]}</span>
                      </p>
                    )}
                  </div>

                  {/* Campo Estatus */}
                  <div className="space-y-2">
                    <label className="block font-semibold" htmlFor="estatus">
                      Estatus
                    </label>
                    <select
                      onChange={handleChange}
                      name="estatus"
                      id="estatus"
                      defaultValue={'Default'}
                      className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none bg-white ${errors["estatus"]
                          ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-400"
                        }`}
                    >
                      <option value="Default" disabled hidden>Seleccione un Estatus</option>
                      <option value="1">Activo</option>
                      <option value="3">Suspendido</option>
                    </select>
                    {errors["estatus"] && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <span>⚠</span>
                        <span>{errors["estatus"]}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-center">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:ring-gray-300 focus:ring-offset-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 font-medium text-white bg-navy rounded-lg hover:bg-navyhover transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none"
                >
                  Agregar Empleado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddModal;
