/**
 * Removes elements from target that exist in source array.
 * Assumes BOTH arrays are sorted in ascending order.
 * 
 * @returns {string[]} reference to the **same** target array.
 */
export function filterSortedStrArrInplace( target: string[], source: string[] ): string[]
{
    if (source.length === 0 || target.length === 0) return target;

    source = source.slice(); // copy to avoid modifying the original array

    let elem: string;
    let start = 0;
    while (elem = source.shift()!) {
        // Early return if element is greater than last element in target
        if( elem > target[target.length - 1]) return target;
        
        const index = findElementIndex( target, elem, start );
        if( index !== -1 )
        {
            target.splice(index, 1);
            if(
                target.length === 0
                || index >= target.length
            ) return target; // if target is empty, no need to continue

            start = index; // reset start to the found index
        }
    }

    return target;
}

/**
 * Binary search to find the exact index of an element
 * @returns the index of the element if found, -1 otherwise
 */
function findElementIndex(
    target: string[],
    elem: string,
    start: number = 0,
    end: number = target.length
): number
{
    if (start >= end) return -1;

    let mid: number;
    while (start < end) {
        mid = (start + end) >> 1;

        if (target[mid] === elem) return mid; // found exact match
        
        if( target[mid] < elem ) start = mid + 1;
        else end = mid;
    }

    return -1; // not found
}