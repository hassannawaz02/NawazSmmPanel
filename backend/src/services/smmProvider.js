const axios = require('axios');
const config = require('../config');

class SMMProvider {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl || config.smmProvider.url;
    this.apiKey = apiKey || config.smmProvider.apiKey;
  }

  async makeRequest(params) {
    try {
      const response = await axios.post(this.baseUrl, {
        key: this.apiKey,
        ...params,
      });
      return response.data;
    } catch (error) {
      console.error('SMM Provider API Error:', error.message);
      throw new Error(
        error.response?.data?.error || 'SMM Provider API request failed'
      );
    }
  }

  async createOrder(serviceId, url, quantity) {
    const response = await this.makeRequest({ action: 'add', service: serviceId, link: url, quantity });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async checkOrderStatus(orderId) {
    const response = await this.makeRequest({ action: 'status', order: orderId });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async checkMultipleOrderStatus(orderIds) {
    const response = await this.makeRequest({ action: 'status', orders: orderIds.join(',') });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async getServices() {
    const response = await this.makeRequest({ action: 'services' });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async getBalance() {
    const response = await this.makeRequest({ action: 'balance' });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async cancelOrder(orderId) {
    const response = await this.makeRequest({ action: 'cancel', order: orderId });
    if (response.error) throw new Error(response.error);
    return response;
  }

  async refillOrder(orderId) {
    const response = await this.makeRequest({ action: 'refill', order: orderId });
    if (response.error) throw new Error(response.error);
    return response;
  }

  // Create provider instance from DB record
  static fromDB(provider) {
    return new SMMProvider(provider.apiUrl, provider.apiKey);
  }

  // Get default provider instance (from env)
  static getDefault() {
    return new SMMProvider();
  }
}

module.exports = SMMProvider;
