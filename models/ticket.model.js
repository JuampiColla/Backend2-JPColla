import { Schema, model } from 'mongoose';

const ticketSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  products: [{
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Producto'
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

const Ticket = model('tickets', ticketSchema);

export default Ticket;
