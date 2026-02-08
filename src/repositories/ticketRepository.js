import ticketDAO from '../daos/ticketDAO.js';

class TicketRepository {
  /**
   * Crear un nuevo ticket
   */
  async create(ticketData) {
    return await ticketDAO.createTicket(ticketData);
  }

  /**
   * Buscar ticket por ID
   */
  async findById(id) {
    return await ticketDAO.findById(id);
  }

  /**
   * Buscar ticket por código
   */
  async findByCode(code) {
    return await ticketDAO.findByCode(code);
  }

  /**
   * Buscar tickets por usuario
   */
  async findByUserId(userId) {
    return await ticketDAO.findByUserId(userId);
  }

  /**
   * Obtener todos los tickets
   */
  async findAll() {
    return await ticketDAO.findAll();
  }

  /**
   * Actualizar ticket
   */
  async update(id, updateData) {
    return await ticketDAO.updateTicket(id, updateData);
  }

  /**
   * Eliminar ticket
   */
  async delete(id) {
    return await ticketDAO.deleteTicket(id);
  }
}

export default new TicketRepository();
