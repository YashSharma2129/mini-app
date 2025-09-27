import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { kycAPI } from '../../utils/api';
import { validatePAN, validatePhone } from '../../utils/auth';
import { Upload, FileText, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardFooter } from '../ui/card';
import { toast } from '../../hooks/use-toast';

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
  panNumber: yup
    .string()
    .test('pan-format', 'Invalid PAN format', validatePAN)
    .required('PAN number is required'),
  address: yup
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .required('Address is required'),
  phone: yup
    .string()
    .test('phone-format', 'Invalid phone number', validatePhone)
    .required('Phone number is required'),
});

const KYCForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Size Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast({
        title: "Document Required",
        description: "Please upload an ID document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('panNumber', data.panNumber);
      formData.append('address', data.address);
      formData.append('phone', data.phone);
      formData.append('idImage', selectedFile);

      await kycAPI.submitKYC(formData);
      toast({
        title: "Success",
        description: "KYC submitted successfully!",
      });
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit KYC';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your KYC</h1>
          <p className="mt-2 text-gray-600">
            Please provide your details to start trading
          </p>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number
                  </label>
                  <Input
                    type="text"
                    placeholder="ABCDE1234F"
                    {...register('panNumber')}
                  />
                  <p className="text-sm text-gray-500 mt-1">Format: ABCDE1234F</p>
                  {errors.panNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.panNumber.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    {...register('phone')}
                  />
                  <p className="text-sm text-gray-500 mt-1">10-digit mobile number</p>
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Enter your complete address"
                  {...register('address')}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Document Upload
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    {selectedFile && (
                      <div className="flex items-center justify-center mt-2">
                        <FileText className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      KYC Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Your KYC information will be reviewed and approved within 24 hours.
                        You can start browsing products while your KYC is being processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit KYC'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KYCForm;
