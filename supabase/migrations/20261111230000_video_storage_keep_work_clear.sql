-- New-write routing only. This does not classify or move legacy media.
update public.cerebral_routes
set intent = 'Keep reusable source in Git. Route open jobs to HomeSSD Active Work and kept media to Media Library. Generated accepts only reviewed disposable files after migration. Preserve sole originals in Eagle or MediaSSD.',
    updated_at = now()
where route_key = 'video-storage';
