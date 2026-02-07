'use client';

import { useEffect } from 'react';

export default function LayoutFix() {
    useEffect(() => {
        // Disable body scroll
        document.body.style.overflow = 'hidden';

        // Attempt to hide footer if it exists
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.display = 'none';
            footer.style.height = '0';
            footer.style.margin = '0';
            footer.style.padding = '0';
        }

        return () => {
            // Re-enable body scroll
            document.body.style.overflow = 'auto';

            // Restore footer
            if (footer) {
                footer.style.display = 'block';
                footer.style.height = 'auto';
                // Note: exact original margin/padding might vary, but "block" usually restores standard flow
            }
        };
    }, []);

    return null;
}
