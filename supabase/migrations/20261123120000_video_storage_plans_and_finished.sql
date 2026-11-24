-- New-write routing only. This does not move legacy media or plans.
update public.cerebral_routes
set intent = 'Keep reusable source in Git. Plans and research live in their Lane folder. Route open jobs to HomeSSD Active Work and kept media to Media Library. Finished videos go to MediaSSD 05_FINISHED. Generated accepts only reviewed disposable files after migration. Preserve sole originals in Eagle or MediaSSD.',
    updated_at = now()
where route_key = 'video-storage';
