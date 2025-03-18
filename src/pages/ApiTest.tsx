
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TravelDetails } from '@/types';

const ApiTest = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<TravelDetails>({
    coverageType: 'Worldwide',
    originCountry: 'United States',
    destinationCountry: 'France',
    tripType: 'Single Trip',
    startDate: '2023-12-01',
    endDate: '2023-12-15',
    coverType: 'Individual',
    travelers: [{ 
      id: '1',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1988-01-01'
    }]
  });

  const handleInputChange = (field: string, value: string) => {
    setRequestData(prev => ({ ...prev, [field]: value }));
  };

  const handleTravelerDateOfBirthChange = (value: string) => {
    setRequestData(prev => ({
      ...prev,
      travelers: [{ 
        ...prev.travelers[0],
        dateOfBirth: value
      }]
    }));
  };

  const handleOriginCountryChange = (value: string) => {
    setRequestData(prev => ({ ...prev, originCountry: value }));
  };

  const handleDestinationCountryChange = (value: string) => {
    setRequestData(prev => ({ ...prev, destinationCountry: value }));
  };

  const testDirectApi = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Making direct API call with data:', requestData);
      
      const response = await fetch('https://travel-insurance-api.azurewebsites.net/api/getQuotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResponse(data);
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testServiceLayer = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // Import dynamically to avoid circular dependencies
      const { getInsuranceQuotes } = await import('@/services/insurance/quoteService');
      console.log('Making service layer API call with data:', requestData);
      
      const data = await getInsuranceQuotes(requestData);
      console.log('Service response:', data);
      setResponse(data);
    } catch (err) {
      console.error('Service test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Request</CardTitle>
            <CardDescription>Configure test parameters for the travel insurance API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coverageType">Coverage Type</Label>
              <Select 
                defaultValue={requestData.coverageType}
                onValueChange={(value) => handleInputChange('coverageType', value)}
              >
                <SelectTrigger id="coverageType">
                  <SelectValue placeholder="Select coverage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Worldwide">Worldwide</SelectItem>
                  <SelectItem value="Domestic">Domestic</SelectItem>
                  <SelectItem value="Schengen">Schengen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="originCountry">Origin Country</Label>
              <Input 
                id="originCountry" 
                value={requestData.originCountry}
                onChange={(e) => handleOriginCountryChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destinationCountry">Destination Country</Label>
              <Input 
                id="destinationCountry" 
                value={requestData.destinationCountry}
                onChange={(e) => handleDestinationCountryChange(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tripType">Trip Type</Label>
              <Select 
                defaultValue={requestData.tripType}
                onValueChange={(value) => handleInputChange('tripType', value)}
              >
                <SelectTrigger id="tripType">
                  <SelectValue placeholder="Select trip type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single Trip">Single Trip</SelectItem>
                  <SelectItem value="Annual Multi-Trips">Annual Multi-Trips</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={requestData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={requestData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverType">Cover Type</Label>
              <Select 
                defaultValue={requestData.coverType}
                onValueChange={(value) => handleInputChange('coverType', value)}
              >
                <SelectTrigger id="coverType">
                  <SelectValue placeholder="Select cover type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="travelerDateOfBirth">Traveler Date of Birth</Label>
              <Input 
                id="travelerDateOfBirth" 
                type="date" 
                value={requestData.travelers[0].dateOfBirth}
                onChange={(e) => handleTravelerDateOfBirthChange(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={testDirectApi} disabled={loading}>
              {loading ? 'Testing...' : 'Test Direct API Call'}
            </Button>
            <Button onClick={testServiceLayer} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Test Service Layer'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>API response will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <div className="text-center py-4">Loading...</div>}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <h3 className="font-bold">Error:</h3>
                <p>{error}</p>
              </div>
            )}
            
            {response && (
              <div className="space-y-2">
                <h3 className="font-medium">Response Data:</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <Textarea
                    value={JSON.stringify(response, null, 2)}
                    readOnly
                    className="font-mono text-sm h-[400px]"
                  />
                </div>
                <p className="text-sm text-gray-500">Received {Array.isArray(response) ? response.length : 0} plan(s)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiTest;
