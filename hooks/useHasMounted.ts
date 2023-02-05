import {useEffect, useState} from 'react';

export default function useHasMounted(): boolean {
    const [hasMounted, setHasMounted] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
    }, [])

    return hasMounted;
}
