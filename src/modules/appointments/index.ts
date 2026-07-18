export { appointmentRouter } from "./appointment.routes.js";
export { appointmentController } from "./appointment.controller.js";
export { appointmentService } from "./appointment.service.js";
export { appointmentRepository } from "./appointment.repository.js";

export { createAppointmentSchema, updateAppointmentSchema } from "./appointment.validation.js";
export type { CreateAppointmentDto, UpdateAppointmentDto } from "./appointment.types.js";
export type { AppointmentRecord } from "./appointment.interfaces.js";
