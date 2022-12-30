VERSION=1.0.0-dev
IMAGE_TAG=ABCD
IMAGE_REPOSITORY=ABCDE

for COMMAND in "$@"
do
    case "${COMMAND}"
        in
        "prod_request")
            VERSION=0.0.3
            IMAGE_TAG=devorai/ai-oracle-prod-request
            IMAGE_REPOSITORY=$IMAGE_TAG:$VERSION
        ;;
        "staging")
            VERSION=0.0.4
            IMAGE_TAG=devorai/ai-oracle-staging
            IMAGE_REPOSITORY=$IMAGE_TAG:$VERSION
        ;;
        "build")
            echo BUILD IMAGE: $IMAGE_REPOSITORY
            docker build --no-cache \
            -f ./Dockerfile -t $IMAGE_REPOSITORY ../
        ;;
        "push")
            docker push $IMAGE_REPOSITORY
        ;;
    esac
done
echo DONE AND DONE
