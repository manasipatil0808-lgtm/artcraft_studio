import { motion } from 'motion/react';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { HandDrawnHeart } from '../components/HandDrawnIcons';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-20 fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint-50 via-white to-brand-50 p-12 md:p-20 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-mint-100/60 text-mint-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            <MessageCircle className="w-4 h-4" /> Say Hello
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-800 mb-6 leading-tight">
            Let's <span className="text-brand-600 font-script">Connect</span>
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            Have a question about a product, want a custom order, or just want to chat about art? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-mint-200/30 to-brand-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-brand-200/30 to-mint-200/30 rounded-full blur-3xl"
        />
      </section>

      {/* Contact Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          <div>
            <h2 className="text-3xl font-serif font-semibold text-gray-800 mb-2">Get in Touch</h2>
            <p className="text-gray-500 font-light">We typically respond within 24 hours</p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Mail,
                label: 'Email Us',
                value: 'artcraftstudio0821@gmail.com',
                desc: 'For orders & inquiries',
                color: 'brand',
              },
              {
                icon: Phone,
                label: 'Call Us',
                value: '+91 98765 43210',
                desc: 'Mon-Sat, 10am - 7pm IST',
                color: 'mint',
              },
              {
                icon: MapPin,
                label: 'Visit Us',
                value: 'Mumbai, Maharashtra',
                desc: 'By appointment only',
                color: 'yellow',
              },
              {
                icon: Clock,
                label: 'Business Hours',
                value: 'Mon - Sat: 10AM - 7PM',
                desc: 'Sunday: Closed',
                color: 'green',
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="flex gap-4 items-start group"
              >
                <div className={`bg-${item.color === 'brand' ? 'brand' : item.color === 'mint' ? 'mint' : item.color}-100 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <item.icon className={`w-5 h-5 text-${item.color === 'brand' ? 'brand' : item.color === 'mint' ? 'mint' : item.color}-600`} />
                </div>
                <div>
                  <p className="font-serif font-semibold text-gray-800">{item.label}</p>
                  <p className="text-gray-700 font-medium">{item.value}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mini decorative card */}
          <div className="watercolor-card p-6 bg-gradient-to-br from-brand-50 to-mint-50 text-center">
            <HandDrawnHeart className="w-8 h-8 text-brand-500 mx-auto mb-3" />
            <p className="font-serif text-gray-700 italic">
              "Every great creation begins with a conversation."
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="watercolor-card p-8 md:p-10">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <h2 className="text-2xl font-serif font-semibold text-gray-800">Send us a Message</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-400 focus:outline-none transition-colors bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hello@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-400 focus:outline-none transition-colors bg-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                <select
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-400 focus:outline-none transition-colors bg-white/50"
                >
                  <option value="">Select a topic</option>
                  <option value="order">Order Inquiry</option>
                  <option value="custom">Custom Order Request</option>
                  <option value="product">Product Question</option>
                  <option value="seller">Become a Seller</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-brand-400 focus:outline-none transition-colors bg-white/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full hand-drawn-btn flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-400">
                We respect your privacy and will never share your information.
              </p>
            </form>
          </div>
        </motion.div>
      </section>

      {/* FAQ Mini Section */}
      <section className="watercolor-card p-12 md:p-16">
        <h2 className="text-4xl font-serif font-semibold text-center mb-4 text-gray-800">Common Questions</h2>
        <p className="text-center text-gray-500 mb-12 text-lg font-light">Quick answers to things you might wonder</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { q: 'How long does shipping take?', a: 'Most orders are delivered within 5-7 business days across India. Custom orders may take 7-14 days.' },
            { q: 'Can I request a custom design?', a: 'Absolutely! Use the custom order option on any customizable product, or contact us directly.' },
            { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery for non-customized items in original condition.' },
            { q: 'How can I become a seller?', a: 'Register as a seller on our platform and start listing your handcrafted products right away!' },
          ].map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h3 className="font-serif font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
