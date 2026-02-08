import purchaseService from '../services/purchaseService.js';

class PurchaseController {
  /**
   * Procesar compra
   */
  async purchase(req, res) {
    try {
      const { userId } = req.params;

      // Verificar que el usuario procesa su propia compra
      if (req.user.id !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'No puedes procesar compra de otro usuario'
        });
      }

      const result = await purchaseService.processPurchase(userId);

      return res.json({
        status: 'success',
        message: result.message,
        ticket: result.ticket
      });
    } catch (error) {
      console.error('Error al procesar compra:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Error al procesar compra'
      });
    }
  }

  /**
   * Obtener tickets del usuario
   */
  async getUserTickets(req, res) {
    try {
      const { userId } = req.params;

      // Verificar que el usuario obtiene sus propios tickets
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para ver estos tickets'
        });
      }

      const result = await purchaseService.getUserTickets(userId);

      return res.json({
        status: 'success',
        total: result.total,
        tickets: result.tickets
      });
    } catch (error) {
      console.error('Error al obtener tickets:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener tickets'
      });
    }
  }

  /**
   * Obtener estadísticas de compras (solo admin)
   */
  async getStatistics(req, res) {
    try {
      const result = await purchaseService.getPurchaseStatistics();

      return res.json({
        status: 'success',
        statistics: result.statistics
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener estadísticas'
      });
    }
  }

  /**
   * Obtener todos los tickets (solo admin)
   */
  async getAllTickets(req, res) {
    try {
      const result = await purchaseService.getAllTickets();

      return res.json({
        status: 'success',
        total: result.total,
        tickets: result.tickets
      });
    } catch (error) {
      console.error('Error al obtener tickets:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Error al obtener tickets'
      });
    }
  }
}

export default new PurchaseController();
