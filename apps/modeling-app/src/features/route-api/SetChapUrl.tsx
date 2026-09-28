import { useConfig } from '@dhis2/app-runtime';
import { useEffect, useState } from 'react';
import { ApiError, enableQueue, getQueue, OpenAPI } from '@dhis2-chap/ui';
import { CircularLoader } from '@dhis2/ui';
import { useQueryClient } from '@tanstack/react-query';

export const SetChapUrl = ({ children }: { children: React.ReactNode }) => {
    const { baseUrl } = useConfig();
    const [isReady, setIsReady] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        OpenAPI.WITH_CREDENTIALS = true;
        // In local dev, bypass the DHIS2 route (which requires DHIS2 2.42+
        // for sub-path support) and hit chap-core directly.
        const devChapUrl = import.meta.env.DHIS2_CHAP_DIRECT_URL;
        OpenAPI.BASE = devChapUrl ?? (baseUrl + '/api/routes/chap/run');

        queryClient.setDefaultOptions({
            queries: {
                retry: (failureCount, error) => {
                    // Route API has issues with 503 errors
                    // retry and enable queueing
                    if (error instanceof ApiError && error.status > 500) {
                        const queue = getQueue();
                        if (queue == undefined) {
                            enableQueue({
                                concurrency: 2,
                            });
                        }
                        if (
                            failureCount > 0 &&
                            queue &&
                            queue?.concurrency !== 1
                        ) {
                            console.log('set API request concurrency to 1');
                            queue.concurrency = 1;
                        }
                        return failureCount < 2;
                    }
                    return false;
                },
            },
        });
        setIsReady(true);
    }, [baseUrl, queryClient]);

    if (!isReady) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    blockSize: '100vh',
                }}
            >
                <CircularLoader />
            </div>
        );
    }

    return <>{children}</>;
};
