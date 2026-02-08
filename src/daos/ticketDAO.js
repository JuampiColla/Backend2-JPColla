import Ticket from '../../models/ticket.model.js';

class TicketDAO {
  async createTicket(ticketData) {
    try {
      const ticket = await Ticket.create(ticketData);
      return ticket;
    } catch (error) {
      throw new Error(`Error al crear ticket: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const ticket = await Ticket.findById(id).populate('purchaser products.productId');
      return ticket;
    } catch (error) {
      throw new Error(`Error al buscar ticket: ${error.message}`);
    }
  }

  async findByCode(code) {
    try {
      const ticket = await Ticket.findOne({ code }).populate('purchaser products.productId');
      return ticket;
    } catch (error) {
      throw new Error(`Error al buscar ticket: ${error.message}`);
    }
  }

  async findByUserId(userId) {
    try {
      const tickets = await Ticket.find({ purchaser: userId }).populate('products.productId');
      return tickets;
    } catch (error) {
      throw new Error(`Error al obtener tickets del usuario: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const tickets = await Ticket.find().populate('purchaser products.productId');
      return tickets;
    } catch (error) {
      throw new Error(`Error al obtener tickets: ${error.message}`);
    }
  }

  async updateTicket(id, updateData) {
    try {
      const ticket = await Ticket.findByIdAndUpdate(id, updateData, { new: true });
      return ticket;
    } catch (error) {
      throw new Error(`Error al actualizar ticket: ${error.message}`);
    }
  }

  async deleteTicket(id) {
    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      return ticket;
    } catch (error) {
      throw new Error(`Error al eliminar ticket: ${error.message}`);
    }
  }
}

export default new TicketDAO();
