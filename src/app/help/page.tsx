'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { withAuthProtection } from '@/components/RouteProtection';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactMethod {
  type: string;
  title: string;
  description: string;
  value: string;
  icon: React.ComponentType<any>;
  available: boolean;
}

function HelpPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I place an order?',
      answer: 'To place an order, browse the marketplace, select your desired products, add them to cart, and proceed to checkout. You can pay using various payment methods including credit cards and bank transfers.',
      category: 'orders'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and digital wallets. All payments are processed securely through our encrypted payment gateway.',
      category: 'payments'
    },
    {
      id: '3',
      question: 'How long does delivery take?',
      answer: 'Delivery times vary depending on your location and the farmer\'s availability. Typically, orders are delivered within 1-3 business days. You can track your order status in real-time.',
      category: 'delivery'
    },
    {
      id: '4',
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel your order if it hasn\'t been confirmed by the farmer yet. Once confirmed, you\'ll need to contact the farmer directly or reach out to our support team.',
      category: 'orders'
    },
    {
      id: '5',
      question: 'How do I become a farmer on the platform?',
      answer: 'To become a farmer, register for an account and select "Farmer" as your role. Complete your profile with farm details, upload necessary documents, and wait for verification. Once approved, you can start listing your products.',
      category: 'farmer'
    },
    {
      id: '6',
      question: 'What if I receive damaged products?',
      answer: 'If you receive damaged or unsatisfactory products, contact the farmer directly through the platform or reach out to our support team. We have a comprehensive refund and replacement policy.',
      category: 'issues'
    },
    {
      id: '7',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" in your dashboard. You\'ll see real-time updates including order confirmation, dispatch, and delivery status.',
      category: 'orders'
    },
    {
      id: '8',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal and payment information is encrypted and stored securely. We comply with international data protection standards.',
      category: 'security'
    }
  ];

  const contactMethods: ContactMethod[] = [
    {
      type: 'phone',
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      value: '+1 (555) 123-4567',
      icon: PhoneIcon,
      available: true
    },
    {
      type: 'email',
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'support@kheetiibazaar.com',
      icon: EnvelopeIcon,
      available: true
    },
    {
      type: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      value: 'Available 9 AM - 6 PM EST',
      icon: ChatBubbleLeftRightIcon,
      available: false
    }
  ];

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'orders', label: 'Orders' },
    { value: 'payments', label: 'Payments' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'farmer', label: 'For Farmers' },
    { value: 'issues', label: 'Issues & Returns' },
    { value: 'security', label: 'Security' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <DashboardLayout
      title="Help & Support"
      subtitle="Find answers to your questions and get help"
      actions={
        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          Back to Dashboard
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto">
        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we help you?</h2>
              <p className="text-gray-600">Search our knowledge base or contact our support team</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <DocumentTextIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600">Learn the basics of using our platform</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <QuestionMarkCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Account Help</h3>
              <p className="text-sm text-gray-600">Manage your account and profile settings</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting</h3>
              <p className="text-sm text-gray-600">Common issues and their solutions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <CheckCircleIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
              <p className="text-sm text-gray-600">Tips for getting the most out of our platform</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-8">
                      <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search terms or category filter.
                      </p>
                    </div>
                  ) : (
                    filteredFAQs.map((faq) => (
                      <div
                        key={faq.id}
                        className="border border-gray-200 rounded-lg"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{faq.question}</h4>
                            <div className="ml-4 flex-shrink-0">
                              {expandedFAQ === faq.id ? (
                                <span className="text-gray-400">−</span>
                              ) : (
                                <span className="text-gray-400">+</span>
                              )}
                            </div>
                          </div>
                        </button>
                        {expandedFAQ === faq.id && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contactMethods.map((method) => (
                    <div
                      key={method.type}
                      className={`p-4 rounded-lg border ${
                        method.available 
                          ? 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50' 
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <method.icon className={`h-6 w-6 mt-1 ${
                          method.available ? 'text-emerald-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{method.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                          <p className={`text-sm font-medium ${
                            method.available ? 'text-emerald-600' : 'text-gray-400'
                          }`}>
                            {method.value}
                          </p>
                          {!method.available && (
                            <span className="text-xs text-gray-500">Coming Soon</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Need immediate help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Our support team is available Monday to Friday, 9 AM to 6 PM EST.
                  </p>
                  <Button className="w-full btn-primary">
                    Start Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withAuthProtection(HelpPage);
