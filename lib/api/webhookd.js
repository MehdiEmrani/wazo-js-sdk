"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Subscription_1 = __importDefault(require("../domain/Subscription"));
exports.default = ((client, baseUrl) => ({
    getSubscriptions: () => client.get(`${baseUrl}/users/me/subscriptions`).then(Subscription_1.default.parseMany),
    getSubscription: (uuid) => client.get(`${baseUrl}/users/me/subscriptions/${uuid}`).then(Subscription_1.default.parse),
    createSubscription: (payload) => client.post(`${baseUrl}/users/me/subscriptions`, payload),
    removeSubscription: (uuid) => client.delete(`${baseUrl}/users/me/subscriptions/${uuid}`),
}));
