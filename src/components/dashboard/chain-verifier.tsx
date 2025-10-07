
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { verifyChain } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function ChainVerifier() {
    const [isLoading, setIsLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const { toast } = useToast();

    const handleVerify = async () => {
        setIsLoading(true);
        setVerificationStatus('idle');
        try {
            const isValid = await verifyChain();
            if (isValid) {
                setVerificationStatus('success');
                toast({
                    title: "Verification Successful",
                    description: "The AuraChain's integrity is intact. All hashes are valid.",
                });
            } else {
                setVerificationStatus('failed');
                 toast({
                    variant: 'destructive',
                    title: "Verification Failed",
                    description: "Chain integrity check failed. A hash mismatch was detected.",
                });
            }
        } catch (error) {
            setVerificationStatus('failed');
            toast({
                variant: 'destructive',
                title: "Verification Error",
                description: "An unexpected error occurred while verifying the chain.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-lg border-primary/10">
            <CardHeader>
                <CardTitle>Chain Integrity</CardTitle>
                <CardDescription>Verify the cryptographic integrity of the entire AuraChain ledger.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
                 <Button onClick={handleVerify} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2" />
                            Verify Chain Integrity
                        </>
                    )}
                </Button>
                {verificationStatus === 'success' && (
                    <Alert className="border-green-500/50 text-green-500">
                        <ShieldCheck className="h-4 w-4 !text-green-500" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                            Chain is valid. All blocks are cryptographically linked and secure.
                        </AlertDescription>
                    </Alert>
                )}
                 {verificationStatus === 'failed' && (
                    <Alert variant="destructive">
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Failed</AlertTitle>
                        <AlertDescription>
                            Hash mismatch detected. The chain may have been tampered with.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
