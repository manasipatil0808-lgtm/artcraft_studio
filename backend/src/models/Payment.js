const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    payment_method: {
      type: DataTypes.STRING(50),
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
    },
    transaction_id: {
      type: DataTypes.STRING(255),
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    supabase_payment_id: {
      type: DataTypes.STRING(255),
    },
  },
  {
    timestamps: true,
    tableName: "payments",
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
  },
);

module.exports = Payment;
